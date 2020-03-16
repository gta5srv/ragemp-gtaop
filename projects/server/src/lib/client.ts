import Util from '@core/util';
import Types from '@core/types';
import Team from '@lib/team'
import Vehicle from '@lib/vehicle'
import Server from '@lib/server'
import { WorldLocation, WorldLocations } from '@lib/world-locations'
import * as Manager from '@lib/managers'
import * as Listeners from '@lib/listeners'
import Zone from '@lib/zone';

export default class Client implements Listeners.ClientListener {
  public _player: PlayerMp
  private _team?: Team
  private _respawnTimer: any
  private _currentZone: Zone|null = null
  private _spawnZone: Zone|null = null

  public static all: Manager.Client = new Manager.Client()

  constructor (player: PlayerMp) {
    this._player = player
    this._respawnTimer = null

    Client.all.add(this)
    Server.listeners.add(this)
  }

  get player () {
    return this._player
  }

  get position () {
    return this._player.position
  }

  set position (position) {
    this._player.position = position
  }

  get heading () {
    return this._player.heading
  }

  set heading (heading) {
    this._player.heading = heading
  }

  get vehicle (): Vehicle | null {
    return this._player.vehicle ? Vehicle.all.byVehicleMp(this._player.vehicle) : null
  }

  get team () {
    return this._team
  }

  set team (team) {
    this._team = team

    if (team instanceof Team) {
      team.setupClient(this)
    }
  }

  get model () {
    return this._player.model
  }

  set model (model) {
    this._player.model = model
  }

  get name () {
    return this._player.name
  }

  get currentZone () {
    return this._currentZone
  }

  set currentZone(currentZone) {
    this._currentZone = currentZone
  }

  get spawnZone () {
    return this._spawnZone
  }

  setSpawnZone (spawnZone: Zone): boolean {
    if (!spawnZone.spawns.length) {
      return false;
    }

    this._spawnZone = spawnZone;
    return true;
  }

  sendMessage (...args: any[]): void {
    let texts = [...args];
    let textsPutTogether = texts.map(text => String(text)).join(' ');

    this._player.outputChatBox(textsPutTogether);
  }

  spawn (timeMs?: number): void {
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
      this._player.spawn(new mp.Vector3(1408.315673828125, 3099.702880859375, 52.74652099609375));
      return;
    }

    this._player.spawn(this._team.getSpawn())
    this._player.giveWeapon(mp.joaat('weapon_compactlauncher'), 50);
  }

  kill (): void {
    this._player.health = 0;
  }

  putInVehicle(v: Vehicle, seat: Types.Seat = Types.Seat.DRIVER) {
    this._player.putIntoVehicle(v.vehicleMp, seat);
  }

  giveWeapon(weaponName: HashOrString, ammo: number): void {
    const weaponHash = mp.joaat(String(weaponName))
    this._player.giveWeapon(weaponHash, ammo)
  }

  loadWorldLocation(worldLocation: WorldLocation) {
    this._player.call('loadInteriorProps', [ worldLocation.position, worldLocation.interiorProps ])
  }

  onClientChat(message: string): void {
    const color = this.team ? '!{' + Util.rgbToHex(...this.team.color) + '}' : '';

    Server.log(`${this.name}: ${message}`);
    Server.sendMessage(`${color}${this.name}: !{#ffffff}${message}`);
  }

  onClientCreateWaypoint(x: number, y: number): void {
    Server.heightMap.getZ(x, y, (z: number) => {
      this.position = new mp.Vector3(x, y, z + 0.5);
    });
  }

  onClientDeath(_reason: number, _killer: Client): void {
    if (this.currentZone) {
      Server.broadcast(`Client ${this.name} died in zone ${this.currentZone.name}`);
      this.currentZone.onZoneExit(this);
    }

    this.spawn(5000);
  }

  onClientReady(): void {
    WorldLocations.all.forEach((worldLocation: WorldLocation) => {
      this.loadWorldLocation(worldLocation)
    })

    this.spawn()
  }
}
