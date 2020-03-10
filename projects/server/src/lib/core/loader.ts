interface ZoneInfo {
  name: string
  position: Array3d,
  group?: string
}
import Server from '@core/server'
import FSHelper from '@core/fs-helper'
import Client from '@lib/client'
import Team from '@lib/team'
import Zone from '@lib/zone'

export default class Loader {
  static run (rootDirectory: string) {
    FSHelper.rootDirectory = rootDirectory

    Loader.clients()
    Loader.teams()
    Loader.zones()
    Loader.heightMap()
  }

  static clients () {
    mp.events.add('playerJoin', (player: PlayerMp) => {
      Server.clients.add(player)
    })

    mp.events.add('playerQuit', (player: PlayerMp) => {
      Server.clients.remove(player)
    })
  }

  static team (info: any) {
    info.base = new mp.Vector3(info.base[0], info.base[1], info.base[2])

    info.spawns = info.spawns.map((spawn: number[]) => {
      return new mp.Vector3(spawn[0], spawn[1], spawn[2])
    })

    if (info.vehicles) {
      info.vehicles.forEach((vehGroup: any, vehGroupIndex: any) => {
        vehGroup.forEach((vehInfo: any, vehGroupItemIndex: any) => {
          info.vehicles[vehGroupIndex][vehGroupItemIndex].spawns = vehInfo.spawns.map((spawn: any) => {
            let position, rotation

            if (Array.isArray(spawn[0])) {
              position = new mp.Vector3(spawn[0][0], spawn[0][1], spawn[0][2])
            }

            if (Array.isArray(spawn[1])) {
              rotation = new mp.Vector3(spawn[1][0], spawn[1][1], spawn[1][2])
            }

            return {
              position: position,
              rotation: rotation
            }
          })
        })
      })
    }

    return new Team(info)
  }

  static teams () {
    let teamsInfo = require('@config/teams').teams

    for (let teamSlug in teamsInfo) {
      let teamInfo = teamsInfo[teamSlug]
      teamInfo.slug = teamSlug

      let team = Loader.team(teamInfo)
      Server.teams.add(team)
    }
  }

  static zones () {
    let zonesInfo = require('@config/zones').zones

    zonesInfo.forEach((zoneInfo: ZoneInfo) => {
      const zone = new Zone(
        zoneInfo.name,
        new mp.Vector3(
          zoneInfo.position[0],
          zoneInfo.position[1],
          zoneInfo.position[2]
        ),
        zoneInfo.group
      )

      // console.log(`Adding zone ${zoneInfo.name} (${zone.position})`)

      Server.zones.add(zone)
    })
  }

  static heightMap () {
    Server.initHeightMap(FSHelper.path('assets/hmap.dat'))
  }
}
