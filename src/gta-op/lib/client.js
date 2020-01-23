import { Team, Vehicle } from '@lib'

export default class Client {
  constructor (player) {
    this._player = player
    this._team = null
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

  get vehicle () {
    return new Vehicle(this._player.vehicle)
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

  sendMessage () {
    let texts = [...arguments]
    let textsPutTogether = texts.map(text => String(text)).join(' ')

    this._player.outputChatBox(textsPutTogether)
  }

  spawn () {
    if (!this._team) {
      this._player.spawn(new mp.Vector3(1408.315673828125, 3099.702880859375, 52.74652099609375))
      return
    }

    this._player.spawn(this.team.getSpawn())
  }

  kill () {
    this._player.health = 0
  }
}
