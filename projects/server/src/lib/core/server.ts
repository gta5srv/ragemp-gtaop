import HeightMap from '@lib/height-map'
import Interval from '@lib/algebra/interval'
import Rectangle from '@lib/algebra/rectangle'
import TeamManager from '@lib/managers/team-manager'
import ClientManager from '@lib/managers/client-manager'
import ZoneManager from '@lib/managers/zone-manager'
import VehicleManager from '@lib/managers/vehicle-manager'

export default class Server {
  static debuggingEnabled = true
  static heightMap: HeightMap

  static readonly clients: ClientManager = new ClientManager()
  static readonly teams: TeamManager = new TeamManager()
  static readonly zones: ZoneManager = new ZoneManager()
  static readonly vehicles: VehicleManager = new VehicleManager()

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
    let client = Server.clients.byPlayerMp(player)
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
