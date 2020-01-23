import { FSHelper, Loader } from '@lib/core'
import { Rectangle, Interval } from '@lib/algebra'
import { HeightMap, TeamFactory, ClientFactory } from '@lib'

const path = require('path')

export default class Server {
  constructor () {
    this.clients = new ClientFactory()

    this.initHeightMap()
    this.initTeams()
  }

  initTeams () {
    this.teams = new TeamFactory()

    let teamsInfo = require('@config/teams').teams

    for (let teamSlug in teamsInfo) {
      let teamInfo = teamsInfo[teamSlug]
      teamInfo.slug = teamSlug

      let team = Loader.team(teamInfo)
      this.teams.add(team)
    }
  }

  initHeightMap () {
    const v = new mp.Vector3(-4300, -4100, 0)
    const v2 = v.add(new mp.Vector3(300 * 30, 150 * 90, 0))
    const area = new Rectangle(new Interval(v.x, v2.x), new Interval(v.y, v2.y))

    let heightMapPath = FSHelper.path('assets/hmap.dat')
    this.heightMap = new HeightMap(heightMapPath, area)
  }

  getZ (v, cb) {
    if (!this.heightMap) {
      throw 'Height map not initialized'
    }

    this.heightMap.getZ(v, z => {
      cb(z)
    })
  }
}
