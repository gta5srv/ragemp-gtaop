import Team from '@lib/team'
import Vehicle from '@lib/vehicle'

export default class Client {
  _player: PlayerMp
  _team: any
  _respawnTimer: any

  constructor (player: PlayerMp) {
    this._player = player
    this._team = null
    this._respawnTimer = null
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
    return this._player.vehicle ? Vehicle.byVehicleMp(this._player.vehicle) : null
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

  sendMessage (...args: any[]) {
    let texts = [...args]
    let textsPutTogether = texts.map(text => String(text)).join(' ')

    this._player.outputChatBox(textsPutTogether)
  }

  spawn (timeMs?: number) {
    if (!this._team) {
      this._player.spawn(new mp.Vector3(1408.315673828125, 3099.702880859375, 52.74652099609375))
      return
    }

    let spawn = this.team.getSpawn()

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

  kill () {
    this._player.health = 0
  }
}
