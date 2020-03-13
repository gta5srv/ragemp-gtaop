import Team from '@lib/team'
import Vehicle from '@lib/vehicle'
import Server from '@lib/server'
import { WorldLocation } from '@lib/world-locations'
import * as Manager from '@lib/managers'
import * as Listeners from '@lib/listeners'

export default class Client implements Listeners.ClientListener {
  private _player: PlayerMp
  private _team?: Team
  private _respawnTimer: any

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

  sendMessage (...args: any[]): void {
    let texts = [...args]
    let textsPutTogether = texts.map(text => String(text)).join(' ')

    this._player.outputChatBox(textsPutTogether)
  }

  spawn (timeMs?: number): void {
    if (this._team === undefined) {
      this._player.spawn(new mp.Vector3(1408.315673828125, 3099.702880859375, 52.74652099609375))
      return
    }

    let spawn = this._team.getSpawn()

    if (this._respawnTimer) {
      clearTimeout(this._respawnTimer)
      this._respawnTimer = null
    }

    if (timeMs) {
      this._respawnTimer = setTimeout(() => {
        this._player.spawn(spawn)
      }, timeMs)
    } else {
      this._player.spawn(spawn)
    }

    this._player.giveWeapon(mp.joaat('weapon_compactlauncher'), 50)
  }

  kill (): void {
    this._player.health = 0
  }

  loadWorldLocation(worldLocation: WorldLocation) {
    this._player.call('loadInteriorProps', [ worldLocation.position, worldLocation.interiorProps ])
  }

  onClientCreateWaypoint(x: number, y: number): void {
    Server.heightMap.getZ(x, y, (z: number) => {
      this.position = new mp.Vector3(x, y, z + 0.5)
    })
  }

  onClientDeath(_reason: number, _killer: Client): void {
    this.spawn(5000)
  }

  onClientReady(): void {
    this.spawn()
  }
}
