import Types from '@core/types';
import Server from '@lib/server'
import Team from '@lib/team';
import Vehicle from '@lib/vehicle';
import Client from '@lib/client';
import Spawnable from '@lib/interfaces/spawnable';
import * as Manager from '@lib/managers';
import * as Listeners from '@lib/listeners'

export class Zone extends Spawnable implements Listeners.ZoneListener, Listeners.TickListener {
  private _name: string;
  private _slug: string;
  private _position: Vector3Mp;
  private _radius: number;
  private _marker: MarkerMp;
  private _colshape: ColshapeMp;
  private _label: TextLabelMp;

  private _tickCount: number = 0;

  private _owner: Team|null = null;
  private _state: Zone.State = Zone.State.NEUTRAL;
  private _progress: number = 0;

  private _progressingTeamBefore: Team|null = null;
  private _progressingTeam: Team|null = null;
  private _savedState: Zone.State;

  public static readonly DEFAULT_RADIUS: number = 5;
  public static readonly DEFAULT_MARKER_COLOR: RGB = [ 255, 255, 255 ];
  public static readonly DEFAULT_VEHICLE_COLORS: [RGB, RGB] = [[ 255, 255, 255 ], [ 255, 255, 255 ]];

  public static readonly PROGRESS_PER_SECOND: number = 1/15; // 15 seconds till complete
  public static readonly TICK_LIMIT: number = 1;
  public static readonly COLSHAPE_RADIUS_MULTIPLIER: number = 0.65; // TODO: Improve logic
  public static readonly MARKER_OPACITY: number = 60;

  public static readonly all: Manager.Zone = new Manager.Zone();
  public readonly clientsInside: Manager.Client = new Manager.Client();
  public readonly vehicles: Manager.Vehicle = new Manager.Vehicle();

  constructor (name: string, slug: string,
               position: Vector3Mp, spawns: Types.Location[] = [],
               group?: string,
               radius: number = Zone.DEFAULT_RADIUS) {
    super();
    super.spawns = spawns;

    this._name = name;
    this._slug = slug;
    this._position = position;
    this._radius = radius;

    this._marker = mp.markers.new(RageEnums.Marker.VERTICAL_CYLINDER, position, radius);

    this._colshape = mp.colshapes.newSphere(
      position.x,
      position.y,
      position.z,
      radius * Zone.COLSHAPE_RADIUS_MULTIPLIER
    );

    this._label = mp.labels.new('', new mp.Vector3(position.x, position.y, position.z + 1.4), {
        los: false,
        font: Types.Fonts.Monospace,
        drawDistance: 40,
    });

    this._savedState = this._state;
    this.OnStateChange(null, this._state);

    Zone.all.add(this);
    Server.listeners.add(this);
  }

  get name () {
    return this._name;
  }

  get slug () {
    return this._slug;
  }

  get position () {
    return this._position;
  }

  get radius () {
    return this._radius;
  }

  get owner () {
    return this._owner;
  }

  get marker () {
    return this._marker;
  }

  get colshape () {
    return this._colshape;
  }

  get label () {
    return this._label;
  }

  get state () {
    return this._state;
  }

  public onZoneEnter(client: Client): void {
    // Client was already in zone
    if (!this.clientsInside.add(client)) {
      return;
    }

    client.currentZone = this;
    Server.log('enter zone', this.name, `(${this.slug})`, client.name, this.clientsInside.count);
  }

  public onZoneExit(client: Client): void {
    // Client wasn't in zone anymore
    if (!this.clientsInside.remove(client)) {
      return;
    }

    client.currentZone = null;
    Server.log('exit zone', this.name, `(${this.slug})`, client.name, this.clientsInside.count);
  }

  public onProgress(progress: number, targetState: Zone.State): void {
    switch (targetState) {
      case Zone.State.NEUTRAL: { // Going back to neutral (was capturing before)
        if (!this._progressingTeamBefore) return;
        const count = Math.floor((1 - progress) * 10);
        const color = this._progressingTeamBefore.gtaColor;
        this.label.text = color + "'".repeat(10 - count) + "~w~" + "'".repeat(count);
        break;
      }

      case Zone.State.OWNED: { // Going back to owned (was neutralizing before)
        if (!this._owner) return;
        const count = Math.floor((1 - progress) * 10);
        const color = this._owner.gtaColor;
        this.label.text = color + "'".repeat(count) + "~w~" + "'".repeat(10 - count);
        break;
      }

      case Zone.State.NEUTRALIZING: { // Neutralizing
        if (!(this._owner && this._progressingTeam)) return;
        const count = Math.floor(progress * 10);
        const color = this._owner.gtaColor;
        this.label.text = color + "'".repeat(10 - count) + "~w~" + "'".repeat(count);
        break;
      }

      case Zone.State.CAPTURING: { // Capturing
        if (!this._progressingTeam) return;
        const count = Math.floor(progress * 10);
        const color = this._progressingTeam.gtaColor;
        this.label.text = color + "'".repeat(count) + "~w~" + "'".repeat(10 - count);
      }
    }
  }

  public OnStateChange(oldState: Zone.State|null, newState: Zone.State): void {
    if (oldState !== null) {
      Server.broadcast(this.slug, `=> Zone state changed from ${oldState ? Zone.State[oldState] : 'none'} to ${Zone.State[newState]}`);
    }

    if (newState === Zone.State.NEUTRAL || newState === Zone.State.OWNED) {
      this.label.text = '';
      this._savedState = newState;
      //Server.broadcast(`Permanently saved state ${Zone.State[newState]} (Owner: ${String(this._owner)})`);
    }

    if (newState === Zone.State.NEUTRAL) {
      this._marker.setColor(
        Zone.DEFAULT_MARKER_COLOR[0],
        Zone.DEFAULT_MARKER_COLOR[1],
        Zone.DEFAULT_MARKER_COLOR[2],
        Zone.MARKER_OPACITY
      );

      this.vehicles.items.forEach((vehicle: Vehicle) => {
        vehicle.colors = Zone.DEFAULT_VEHICLE_COLORS;
      });
    }

    if (newState === Zone.State.OWNED && this._owner !== null) {
      const owner: Team = this._owner;

      this._marker.setColor(
        owner.color[0],
        owner.color[1],
        owner.color[2],
        Zone.MARKER_OPACITY
      );

      this.vehicles.items.forEach((vehicle: Vehicle) => {
        vehicle.colors = owner.vehicleColors;
      });
    }

    Client.all.items.forEach((client: Client) => {
      client.call('zoneUpdate', JSON.stringify(this.zoneUpdateObject()));
    });
  }

  getTeamPresences (): Zone.TeamPresence[] {
    if (!this.clientsInside.count) {
      return [];
    }

    let teamCounters: any = {};

    this.clientsInside.items.forEach((client: Client) => {
      if (client.team) {
        const slug = client.team.slug;
        teamCounters[slug] = slug in Object.keys(teamCounters) ? teamCounters[slug] + 1 : 1;
      }
    });

    var teamCountsArray = [];
    for (let teamSlug in teamCounters) {
      teamCountsArray.push([teamSlug, teamCounters[teamSlug]]);
    }

    // return teams
    let mergedTeamPresences: Zone.TeamPresence[] = [];
    let continueCount = 0;

    teamCountsArray.sort(function(a, b) {
        return a[1] < b[1] ? -1 : (a[1] > b[1] ? 1 : 0);
    }).forEach((v, i,  a) => {
      const foundTeam = Team.all.bySlug(v[0])
      if (foundTeam === null || continueCount-- > 0) {
        return true;
      }

      let teams: Team[] = [];

      let count = i;
      while (a[count] && a[count][1] === v[1]) {
        const teamFound = Team.all.bySlug(a[count][0]);
        if (teamFound) teams.push(teamFound);

        count++;
        continueCount++;
      }

      mergedTeamPresences.push({
        team: teams.length > 1 ? teams : teams[0],
        count: v[1]
      });
    })

    return mergedTeamPresences;
  }

  public onTick(msElapsed: number): void {
    this._tickCount++;
    if ((this._tickCount % Zone.TICK_LIMIT) !== 0) {
      return;
    }

    const teamPresences = this.getTeamPresences();
    let potentialState: Zone.State = this._state;
    let reverseProgress: boolean = false;
    let paused: boolean = false;

    //this.clientsInside.sendMessage(String(teamPresences));

    // Teams are present
    if (teamPresences.length) {
      // Server.broadcast(this._slug, 'Teams are present');
      // Server.broadcast(typeof teamPresences[0].team, String(teamPresences[0].team))

      // Several teams have equal zone presence
      if (Array.isArray(teamPresences[0].team)) {
        this.clientsInside.sendMessage(this._slug, 'Several teams are equally present');
        paused = true;
      } else { // One team has most zone presence
        // Server.broadcast(this._slug, `Team ${teamPresences[0].team.name} has the most presence`);

        if (this._progressingTeam !== teamPresences[0].team) {
          this._progressingTeam = teamPresences[0].team; // NEW
          // this.clientsInside.sendMessage(`!{#ff0000}Progressing team is now ${this._progressingTeam}`.toUpperCase());
        }

        // Was being neutralized
        if (this._state === Zone.State.NEUTRALIZING) {
          // Server.broadcast(this._slug, `Was being neutralized`);

          // Most present team wasn't neutralizing before
          //if (this._progressingTeam !== teamPresences[0].team) {
            // Server.broadcast(this._slug, `Most present team wasn't neutralizing before`);
            //this._progressingTeam = teamPresences[0].team; // NEW


            // Owner wants to prevent neutralizing
            if (this._owner === teamPresences[0].team) {
              // Server.broadcast(this._slug, `Most present team is owner, will therefore reverse progression`);
              reverseProgress = true;
            }
        //  }
        }

        if (this._state === Zone.State.OWNED && this._owner != teamPresences[0].team) {
          // Server.broadcast(this._slug, `Zone is owned by ${this._owner} and will be neutralized by ${teamPresences[0].team.name} now`);

          //this._progressingTeam = teamPresences[0].team;
          potentialState = Zone.State.NEUTRALIZING;
        }

        if (this._state === Zone.State.NEUTRAL) {
          // Server.broadcast(this._slug, `Zone is neutral and will be captured by ${teamPresences[0].team.name} now`);

          //this._progressingTeam = teamPresences[0].team;
          potentialState = Zone.State.CAPTURING;
        }
      }
    } else { // Nobody in the zone anymore
      // this.clientsInside.sendMessage('Nothing to do')
      if (this._state !== this._savedState) {
        if (this._progressingTeam != null) {
          this._progressingTeamBefore = this._progressingTeam;
        }

        this._progressingTeam = null;
        reverseProgress = true;

        // Server.broadcast(this._slug, `Zone left by everyone`);
        // Server.broadcast(this._slug, `Zone starts reversing progression`);
      }
    }

    const progressForThisTick = msElapsed / 1000 * Zone.PROGRESS_PER_SECOND * Zone.TICK_LIMIT
    const progressBefore = this._progress;

    if (!paused) {
      if (reverseProgress) {
        // Server.broadcast(this._slug,
        //   'Progress ' + this._progress + ' - '
        //   + (progressForThisTick * 2) + ' = !{#ff0000}'
        //   + (this._progress - progressForThisTick * 1.5)
        // );
        this._progress -= progressForThisTick * 1.5;
      } else {
        if (potentialState === Zone.State.CAPTURING || potentialState === Zone.State.NEUTRALIZING) {
          this._progress += progressForThisTick;

          // Server.broadcast(this._slug,
          //   'Progress ' + this._progress + ' + '
          //   + (progressForThisTick) + ' = '
          //   + (this._progress + progressForThisTick)
          // );
        }
      }
    }

    if (progressBefore != this._progress) {
      const progress = this._progress < 0 ? 0 : (this._progress > 1 ? 1 : this._progress);
      const targetState = reverseProgress ? this._savedState : potentialState;
      this.onProgress(progress, targetState);
    }

    if (this._progress <= 0) {
      this._progress = 0;
      this._progressingTeam = null;
      potentialState = this._savedState;

      if (reverseProgress) {
        // console.log(this._slug, 'reversed?', Boolean(reverseProgress));
        // Server.broadcast(this._slug, `Progress will be reversed to ${Zone.State[potentialState]}`);
      }
    } else if (this._progress >= 1) {
      if (potentialState === Zone.State.CAPTURING) {
        this._owner = this._progressingTeam;
        potentialState = Zone.State.OWNED;
      }

      if (potentialState === Zone.State.NEUTRALIZING) {
        this._owner = null;
        potentialState = Zone.State.NEUTRAL;
      }

      this._progressingTeam = null;
      this._progress = 0;

      // Server.broadcast(this._slug, `Progress finished, will lead to ${Zone.State[potentialState]}`);
    }

    if (this._state !== potentialState) {
      // State is going to change
      const oldState = this._state;
      this._state = potentialState;
      this.OnStateChange(oldState, potentialState);
    }
  }

  private zoneUpdateObject (): any {
    return {
      slug: this.slug,
      state: this.state,
      owner: this.owner ? this.owner.slug : null
    };
  }

  public toJSON () {
    return {
      slug: this.slug,
      name: this.name,
      position: this.position,
      state: this.state,
      owner: this.owner ? this.owner.slug : null,
      vehicleIds: this.vehicles.idArray()
    };
  }
}

export namespace Zone {
  export enum State {
    NEUTRAL,
    OWNED,
    CAPTURING,
    NEUTRALIZING
  }

  export interface TeamPresence {
    team: Team|Team[];
    count: number;
  }
}

export default Zone
