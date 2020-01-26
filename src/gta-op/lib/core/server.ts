import { Loader } from '@core/loader'
import { Rectangle, Interval } from '@lib/algebra'
import { TeamManager, ClientManager } from '@lib/managers'
import { HeightMap } from '@lib'

export default class Server {
  static debuggingEnabled = true

  static clients = new ClientManager()
  static teams = new TeamManager()
  static heightMap

  static initHeightMap (heightMapPath) {
    const v = new mp.Vector3(-4100, -4300, 0)
    const v2 = v.add(new mp.Vector3(300 * 30, 150 * 90, 0))
    const area = new Rectangle(new Interval(v.x, v2.x), new Interval(v.y, v2.y))

    Server.heightMap = new HeightMap(heightMapPath, area)
  }

  static getZ (v, cb) {
    if (!Server.heightMap) {
      throw Exception('Height map not initialized yet')
    }

    Server.heightMap.getZ(v, z => {
      cb(z)
    })
  }

  static log () {
    console.log(...arguments)
  }

  static debug () {
    if (!Server.debuggingEnabled) {
      return
    }

    Server.log(...arguments)
  }

  static sendMessageToAll () {
    Server.clients.sendMessage(...arguments)
  }

  static broadcast () {
    Server.log(...arguments)
    Server.sendMessageToAll(...arguments)
  }

  static playerArgsToClientArray () {
    let args = [...arguments]

    let player = args.shift()
    let client = Server.clients.byPlayer(player)
    args.unshift(client)

    return args
  }

  static addCommand (command, callback) {
    mp.events.addCommand(command, function () {
      callback.apply(null, Server.playerArgsToClientArray(...arguments))
    })
  }

  static addEvent (event, callback) {
    mp.events.add(event, function () {
      callback.apply(null, Server.playerArgsToClientArray(...arguments))
    })
  }
}
