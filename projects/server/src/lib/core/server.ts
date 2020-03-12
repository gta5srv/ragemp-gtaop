import HeightMap from '@lib/height-map'
import Interval from '@lib/algebra/interval'
import Rectangle from '@lib/algebra/rectangle'
import TeamManager from '@lib/managers/team-manager'
import ClientManager from '@lib/managers/client-manager'
import ZoneManager from '@lib/managers/zone-manager'
import VehicleManager from '@lib/managers/vehicle-manager'

export default class Server {
  static debuggingEnabled: boolean = true
  static heightMap: HeightMap

  static readonly clients: ClientManager = new ClientManager()
  static readonly teams: TeamManager = new TeamManager()
  static readonly zones: ZoneManager = new ZoneManager()
  static readonly vehicles: VehicleManager = new VehicleManager()


  private static loopTimer: NodeJS.Timeout|null = null
  private static loopLastRun: Date|null = null
  private static msSinceTimeIncrease: number = 0

  private static readonly GAME_TIME_MULTIPLIER: number = 50
  private static readonly TICK_RATE: number = 200


  public static initHeightMap (heightMapPath: string): void {
    const v = new mp.Vector3(-4100, -4300, 0)
    const v2 = v.add(new mp.Vector3(300 * 30, 150 * 90, 0))
    const area = new Rectangle(new Interval(v.x, v2.x), new Interval(v.y, v2.y))

    Server.heightMap = new HeightMap(heightMapPath, area)
  }

  static log (...args: any[]): void {
    console.log(...args)
  }

  static debug (...args: any[]): void {
    if (!Server.debuggingEnabled) {
      return
    }

    Server.log(...args)
  }

  static sendMessageToAll (...args: any[]): void {
    Server.clients.sendMessage(...args)
  }

  static broadcast (...args: any[]): void {
    Server.log(...args)
    Server.sendMessageToAll(...args)
  }

  static playerArgsToClientArray (...args: any[]): any[] {
    let player = args.shift()

    let client = Server.clients.byPlayerMp(player)
    args.unshift(client)

    return args
  }

  static addCommand (command: string, callback: Function): void {
    mp.events.addCommand(command, function (...args: any[]) {
      callback.apply(null, Server.playerArgsToClientArray(...args))
    })
  }

  static addEvent (event: string, callback: Function): void {
    mp.events.add(event, function (...args: any[]) {
      callback.apply(null, Server.playerArgsToClientArray(...args))
    })
  }


  /**
   * Starts cricital server functionality
   */
  public static start (): void {
    Server.runLoop()
  }


  /**
   * Used to call the main loop
   */
  private static runLoop (): void {
    // Loop timer is given, stop it first
    if (Server.loopTimer) {
      clearTimeout(Server.loopTimer)
    }

    // Milliseconds elapsed since last loop run is zero by default
    let msElapsedSinceLastRun = 0

    // Loop ran before and saved it's timing
    if (Server.loopLastRun != null) {
      // Calculate real milliseconds elapsed since last loop
      msElapsedSinceLastRun = new Date().getTime() - Server.loopLastRun.getTime()
    }

    // Call actual loop function
    Server.loop(msElapsedSinceLastRun)

    // Time to wait until next loop run
    let timeToNextLoopRun = Server.TICK_RATE

    // Loop ran before and saved it's timing
    if (Server.loopLastRun != null) {
      // We calculate total elapsed milliseconds from last loop run until this call
      const msElapsedNow = new Date().getTime() - Server.loopLastRun.getTime()

      // More time elapsed than desired by given tick rate,
      // therefore we substract difference for next timer
      if (msElapsedNow > Server.TICK_RATE) {
        timeToNextLoopRun -= msElapsedNow - Server.TICK_RATE
      }
    }

    // Set loop timer
    Server.loopTimer = setTimeout(Server.runLoop, timeToNextLoopRun)
    // Save last run time
    Server.loopLastRun = new Date()
  }


  /**
   * Main loop
   *
   * @param msElapsed Milliseconds elapsed since last run
   */
  private static loop (msElapsed: number): void {
  }
}
