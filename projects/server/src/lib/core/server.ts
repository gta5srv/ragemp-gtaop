import Rectangle from '@lib/algebra/rectangle'
import { Interval } from '@lib/algebra/index'
import { TeamManager, ClientManager } from '@lib/managers/index'
import { HeightMap } from '@lib/index'

export default class Server {
  static debuggingEnabled = true

  static clients: ClientManager = new ClientManager()
  static teams: TeamManager = new TeamManager()
  static heightMap: HeightMap

  static initHeightMap (heightMapPath: string) {
    const v = new mp.Vector3(-4100, -4300, 0)
    const v2 = v.add(new mp.Vector3(300 * 30, 150 * 90, 0))
    const area = new Rectangle(new Interval(v.x, v2.x), new Interval(v.y, v2.y))

    Server.heightMap = new HeightMap(heightMapPath, area)
  }

  static log (...args: any[]) {
    console.log(...args)
  }

  static debug (...args: any[]) {
    if (!Server.debuggingEnabled) {
      return
    }

    Server.log(...args)
  }

  static sendMessageToAll (...args: any[]) {
    Server.clients.sendMessage(...args)
  }

  static broadcast (...args: any[]) {
    Server.log(...args)
    Server.sendMessageToAll(...args)
  }

  static playerArgsToClientArray (...args: any[]) {
    let player = args.shift()
    let client = Server.clients.byPlayer(player)
    args.unshift(client)

    return args
  }

  static addCommand (command: string, callback: Function) {
    mp.events.addCommand(command, function (...args: any[]) {
      callback.apply(null, Server.playerArgsToClientArray(...args))
    })
  }

  static addEvent (event: string, callback: Function) {
    mp.events.add(event, function (...args: any[]) {
      callback.apply(null, Server.playerArgsToClientArray(...args))
    })
  }
}
