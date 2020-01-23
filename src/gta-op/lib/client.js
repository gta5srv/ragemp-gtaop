export default class Client {
  constructor (player) {
    this.player = player
    this.team = null
  }

  get team () {
    return this._team
  }

  set team (team) {
    if (team != null) {
      const modelIndex = Math.floor(Math.random() * team._models.length)
      this.player.model = mp.joaat(team._models[modelIndex])
    }

    this._team = team
  }

  spawn () {
    if (!this.team) {
      this.player.spawn(new mp.Vector3(1408.315673828125, 3099.702880859375, 52.74652099609375))
      return
    }

    this.player.spawn(this.team.getSpawn())
  }

  kill () {
    this.player.health = 0
  }
}
