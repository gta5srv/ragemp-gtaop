import Util from '@core/util';
import Types from '@core/types';
import Team from '@lib/team'
import Vehicle from '@lib/vehicle'
import Server from '@lib/server'
import { WorldLocation, WorldLocations } from '@lib/world-locations'
import * as Manager from '@lib/managers'
import * as Listeners from '@lib/listeners'
import Zone from '@lib/zone';

export default class Client implements EntityAdapter, Listeners.ClientListener, Listeners.VehicleListener {
  public readonly mp: PlayerMp;

  private _team?: Team
  private _respawnTimer: any
  private _currentZone: Zone|null = null
  private _spawnZone: Zone|null = null

  public static all: Manager.Client = new Manager.Client()

  constructor (player: PlayerMp) {
    this.mp = player
    this._respawnTimer = null

    Client.all.add(this)
    Server.listeners.add(this)
  }

  get position () {
    return this.mp.position
  }

  set position (position) {
    this.mp.position = position
  }

  get heading () {
    return this.mp.heading
  }

  set heading (heading) {
    this.mp.heading = heading
  }

  get vehicle (): Vehicle | null {
    return this.mp.vehicle ? Vehicle.all.byVehicleMp(this.mp.vehicle) : null
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
    return this.mp.model
  }

  set model (model) {
    this.mp.model = model
  }

  get name () {
    return this.mp.name
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

    this.mp.outputChatBox(textsPutTogether);
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
      this.mp.spawn(new mp.Vector3(1408.315673828125, 3099.702880859375, 52.74652099609375));
      return;
    }

    this.mp.spawn(this._team.getSpawn())
    this.mp.giveWeapon(mp.joaat('weapon_compactlauncher'), 50);
  }

  kill (): void {
    this.mp.health = 0;
  }

  call (eventName: string, ...args: any[]) {
    this.mp.call(eventName, args);
  }

  putInVehicle(v: Vehicle, seat: Types.Seat = Types.Seat.DRIVER) {
    this.mp.putIntoVehicle(v.vehicleMp, seat);
  }

  giveWeapon(weaponName: HashOrString, ammo: number): void {
    const weaponHash = mp.joaat(String(weaponName))
    this.mp.giveWeapon(weaponHash, ammo)
  }

  loadWorldLocation(worldLocation: WorldLocation) {
    this.call('loadInteriorProps', worldLocation.position, worldLocation.interiorProps);
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
      this.loadWorldLocation(worldLocation);
    });

    this.call('vehiclesAdded', JSON.stringify(Vehicle.all));
    this.call('teamsAdd', JSON.stringify(Team.all));
    this.call('zonesAdd', JSON.stringify(Zone.all));

    this.spawn()
  }

  onVehicleDeath(vehicle: Vehicle): void {
    console.log('VEHICLE DEATH', vehicle.mp.model);
  }

  onVehicleAdd(vehicle: Vehicle): void {
    console.log('VEHICLE ADDED');
    this.call('vehiclesAdded', JSON.stringify([ vehicle ]));
  }
}
