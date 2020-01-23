import { Team } from '@lib'

export default class Loader {
  static team (info) {
    info.base = new mp.Vector3(info.base[0], info.base[1], info.base[2])

    info.spawns = info.spawns.map(spawn => {
      return new mp.Vector3(spawn[0], spawn[1], spawn[2])
    })

    if (info.vehicles) {
      info.vehicles.forEach((vehGroup, vehGroupIndex) => {
        vehGroup.forEach((vehInfo, vehGroupItemIndex) => {
          info.vehicles[vehGroupIndex][vehGroupItemIndex].spawns = vehInfo.spawns.map(spawn => {
            let spawnInfo = {}

            if (Array.isArray(spawn[0])) {
              spawnInfo.position = new mp.Vector3(spawn[0][0], spawn[0][1], spawn[0][2])
            }

            if (Array.isArray(spawn[1])) {
              spawnInfo.rotation = new mp.Vector3(spawn[1][0], spawn[1][1], spawn[1][2])
            }

            return spawnInfo
          })
        })
      })
    }

    return new Team(info)
  }
}
