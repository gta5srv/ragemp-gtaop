import Server from '@lib/server';
import Team from '@lib/team';
import Vehicle from '@lib/vehicle';
import Zone from '@lib/zone';
import * as Manager from '@lib/managers';
import * as Listeners from '@lib/listeners';
import { WorldLocation, WorldLocations } from '@lib/world-locations';
import Util from '@core/util';

export default class Client implements EntityAdapter, Listeners.ClientListener, Listeners.VehicleListener {
  public readonly mp: PlayerMp;

  private _team?: Team;
  private _respawnTimer: any;
  private _currentZone: Zone|null = null;
  private _spawnZone: Zone|null = null;
  private _isLoggedIn: boolean = false;

  public static all: Manager.Client = new Manager.Client();

  constructor (player: PlayerMp) {
    this.mp = player;
    this._respawnTimer = null;

    Client.all.add(this);
    Server.listeners.add(this);
  }


  get position () {
    return this.mp.position;
  }

  set position (position) {
    this.mp.position = position;
  }

  get heading () {
    return this.mp.heading;
  }

  set heading (heading) {
    this.mp.heading = heading;
  }

  get vehicle (): Vehicle | null {
    return this.mp.vehicle ? Vehicle.all.byVehicleMp(this.mp.vehicle) : null;
  }

  get team () {
    return this._team;
  }

  set team (team) {
    this._team = team;

    if (team instanceof Team) {
      team.setupClient(this);
    }
  }

  get model () {
    return this.mp.model;
  }

  set model (model) {
    this.mp.model = model;
  }

  get name () {
    return this.mp.name;
  }

  get currentZone () {
    return this._currentZone;
  }

  set currentZone(currentZone) {
    this._currentZone = currentZone
  }

  get spawnZone () {
    return this._spawnZone
  }


  public setSpawnZone (spawnZone: Zone): boolean {
    if (!spawnZone.spawns.length) {
      return false;
    }

    this._spawnZone = spawnZone;
    return true;
  }


  public sendMessage (...args: any[]): void {
    let texts = [...args];
    let textsPutTogether = texts.map(text => String(text)).join(' ');

    this.mp.outputChatBox(textsPutTogether);
  }


  public spawn (timeMs?: number): void {
    if (this._respawnTimer) {
      clearTimeout(this._respawnTimer);
      this._respawnTimer = null;
    }

    if (timeMs) {
      this._respawnTimer = setTimeout(() => {
        this.spawn.call(this);
      }, timeMs);

      return;
    }

    if (this.spawnZone !== null) {
      this.spawnZone.spawn(this);
      return;
    }

    if (this._team === undefined) {
      const location = WorldLocations.byName('cocaine');

      if (location) {
        WorldLocations.tp(this, location);
      } else {
        this.mp.spawn(new mp.Vector3(1408.315673828125, 3099.702880859375, 45.74652099609375));
      }

      return;
    }

    this.mp.spawn(this._team.getSpawn())
    this.mp.giveWeapon(mp.joaat('weapon_compactlauncher'), 50);
  }


  public kill (): void {
    this.mp.health = 0;
  }


  public call (eventName: string, ...args: any[]) {
    this.mp.call(eventName, args);
  }


  public putInVehicle(v: Vehicle, seat: RageEnums.VehicleSeat = RageEnums.VehicleSeat.DRIVER) {
    this.mp.putIntoVehicle(v.vehicleMp, seat);
  }


  public giveWeapon(weaponName: HashOrString, ammo: number): void {
    const weaponHash = mp.joaat(String(weaponName))
    this.mp.giveWeapon(weaponHash, ammo)
  }


  public loadWorldLocation(worldLocation: WorldLocation) {
    this.call('loadInteriorProps', worldLocation.position, worldLocation.interiorProps);
  }


  public onClientChat(message: string): void {
    const color = this.team ? '!{' + Util.rgbToHex(...this.team.color) + '}' : '';

    Server.log(`${this.name}: ${message}`);
    Server.sendMessage(`${color}${this.name}: !{#ffffff}${message}`);
  }


  public onClientCreateWaypoint(x: number, y: number): void {
    Server.heightMap.getZ(x, y, (z: number) => {
      this.position = new mp.Vector3(x, y, z + 0.5);
    });
  }


  public onClientDeath(_reason: number, _killer: Client): void {
    if (this.currentZone) {
      Server.broadcast(`Client ${this.name} died in zone ${this.currentZone.name}`);
      this.currentZone.onZoneExit(this);
    }

    this.spawn(5000);
  }


  public onClientReady(): void {
    WorldLocations.all.forEach((worldLocation: WorldLocation) => {
      this.loadWorldLocation(worldLocation);
    });

    this.call('vehiclesAdded', JSON.stringify(Vehicle.all));
    this.call('teamsAdd', JSON.stringify(Team.all));
    this.call('zonesAdd', JSON.stringify(Zone.all));

    this.spawn();
    this.sendMessage('!{#34c6eb}Welcome to OPPOSING FORCES. To start exploring, use !{#ffff00}/help');
  }


  public onClientRequestAccountStatus () {
    Server.db.getUserBySocialClub(this.mp.socialClub, (userData) => {
      const salt = userData ? userData.PasswordSalt : undefined;
      this.call('OP.accountStatusUpdate', this.mp.socialClub, this._isLoggedIn, salt);
    });
  }


  public onClientTryLogin (hash: string): void {
    if (!hash) {
      this.call('OP.loginResponse', false, 'Invalid hash provided');
      return;
    }

    Server.db.checkUserPassword(this.mp.socialClub, hash, (success: boolean) => {
      this._isLoggedIn = success;

      if (success) {
        this.call('OP.loginResponse', true);
      } else {
        this.call('OP.loginResponse', false, 'Wrong password given');
      }
    });
  }


  public onClientTryRegister(email: string, hash: string, salt: string): void {
    let errors = [];

    if (!Util.isEmail(email)) {
      errors.push('Email invalid');
    }
    if (!(typeof hash === 'string' && hash.length)) {
      errors.push('Invalid hash provided');
    }
    if (!(typeof salt === 'string' && salt.length)) {
      errors.push('Invalid salt provided');
    }

    if (errors.length) {
      this.call('OP.registerResponse', false, errors.join(', '));
      return;
    }

    Server.db.addUser(this.mp.socialClub, email, hash, salt, (err?: string) => {
      if (err) {
        this.call('OP.registerResponse', false, err);
        return;
      }

      this.call('OP.registerResponse', true);
    });
  }


  public onClientRequestTeamJoin(teamSlug: string): void {
    const team = Team.all.bySlug(teamSlug);

    if (!team) {
      this.call('OP.teamJoinResponse', false, 'Team not found');
      return;
    }

    if (team.isFull) {
      this.call('OP.teamJoinResponse', false, 'Team is full');
      return;
    }

    this.team = team;
  	this.spawn();

    this.call('OP.teamJoinResponse', true);
  }


  public onClientRequestTeamInfos(): void {
    let teamInfos: any = {};

    Team.all.items.forEach((team: Team) => {
      teamInfos[team.slug] = {
        isFull: team.isFull,
        isBoosted: team.isBoosted
      };
    });

    this.call('OP.teamInfosResponse', JSON.stringify(teamInfos));
  }


  public onVehicleDeath(vehicle: Vehicle): void {
    console.log('client VEHICLE DEATH');
  }


  public onVehicleAdd(vehicle: Vehicle): void {
    this.call('vehiclesAdded', JSON.stringify([ vehicle ]));
  }


  public onVehicleDamage(vehicle: Vehicle, bodyHealthLoss: number, engineHealthLoss: number): void {
  }
}
