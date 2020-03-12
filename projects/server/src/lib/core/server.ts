import HeightMap from '@lib/height-map'
import Client from '@lib/client'
import Interval from '@lib/algebra/interval'
import Rectangle from '@lib/algebra/rectangle'
import Random from '@lib/algebra/random'
import TeamManager from '@lib/managers/team-manager'
import ClientManager from '@lib/managers/client-manager'
import ZoneManager from '@lib/managers/zone-manager'
import VehicleManager from '@lib/managers/vehicle-manager'


/**
 * The Gamemode's heart
 */
class Server {
  public static heightMap: HeightMap

  public static readonly clients: ClientManager = new ClientManager()
  public static readonly teams: TeamManager = new TeamManager()
  public static readonly zones: ZoneManager = new ZoneManager()
  public static readonly vehicles: VehicleManager = new VehicleManager()

  private static loopTimer: NodeJS.Timeout|null = null
  private static loopLastRun: Date|null = null
  private static msSinceTimeIncrease: number = 0

  private static readonly GAME_TIME_MULTIPLIER: number = 50
  private static readonly TICK_RATE: number = 200
  private static readonly DEBUG_MODE: boolean = true


  /**
   * Initialize height map
   *
   * @param heightMapPath The file path to the hmap.dat file
   */
  public static initHeightMap (heightMapPath: string): void {
    const v = new mp.Vector3(-4100, -4300, 0)
    const v2 = v.add(new mp.Vector3(300 * 30, 150 * 90, 0))
    const area = new Rectangle(new Interval(v.x, v2.x), new Interval(v.y, v2.y))

    Server.heightMap = new HeightMap(heightMapPath, area)
  }


  /**
   * Logs to console
   *
   * @param ...args Message parts
   */
  public static log (...args: any[]): void {
    console.log(...args)
  }


  /**
   * Prints debugging to console if DEBUG_MODE is true
   *
   * @param ...args Message parts
   */
  public static debug (...args: any[]): void {
    if (Server.DEBUG_MODE) {
      Server.log(...args)
    }
  }


  /**
   * Sends a message to all players online
   *
   * @param ...args Message parts
   */
  public static sendMessageToAll (...args: any[]): void {
    Server.clients.sendMessage(...args)
  }


  /**
   * Broadcasts a message to console and players
   *
   * @param ...args Message parts
   */
  public static broadcast (...args: any[]): void {
    Server.log(...args)
    Server.sendMessageToAll(...args)
  }


  /**
   * Converts the first argument of an array from PlayerMp to Client instance
   *
   * @param  ...args Argument list
   * @return         Argument list with Client instance first
   */
  private static playerArgsToClientArray (...args: any[]): any[] {
    let player = args.shift()

    let client = Server.clients.byPlayerMp(player)
    args.unshift(client)

    return args
  }


  /**
   * Adds a command (wrapper for mp.events.addCommand) and calls callback
   * with first argument as Client instance instead of PlayerMp
   */
  public static addCommand (command: string, callback: Function): void {
    mp.events.addCommand(command, function (...args: any[]) {
      callback.apply(null, Server.playerArgsToClientArray(...args))
    })
  }


  /**
   * Adds an event (wrapper for mp.events.add) and calls callback
   * with first argument as Client instance instead of PlayerMp
   */
  public static addEvent (event: string, callback: Function): void {
    mp.events.add(event, function (...args: any[]) {
      callback.apply(null, Server.playerArgsToClientArray(...args))
    })
  }


  /**
   * Start tracking clients by adding/removing them from list on join/quit
   */
  private static startTrackingClients (): void {
    mp.events.add('playerJoin', (player: PlayerMp) => {
      Server.clients.add(new Client(player))
    })

    mp.events.add('playerQuit', (player: PlayerMp) => {
      Server.clients.remove(new Client(player))
    })
  }


  /**
   * Starts cricital server functionality
   */
  public static start (): void {
    Server.startTrackingClients()
    Server.Time.randomize()
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
    Server.msSinceTimeIncrease += msElapsed

    // At least a second has passed since last in-game time increase
    const gameMsSinceTimeIncreased = Server.msSinceTimeIncrease * Server.GAME_TIME_MULTIPLIER

    if (gameMsSinceTimeIncreased > 1000) {
      const gameSecsToIncrease = Math.floor(gameMsSinceTimeIncreased / 1000)

      Server.Time.add(gameSecsToIncrease)
      Server.msSinceTimeIncrease -= gameSecsToIncrease * 1000 / Server.GAME_TIME_MULTIPLIER
    }
  }
}

namespace Server {
  export class Time {
    static get hour () {
      return mp.world.time.hour
    }

    static set hour (hour: number) {
      mp.world.time.hour = hour
    }

    static get minute () {
      return mp.world.time.minute
    }

    static set minute (minute: number) {
      mp.world.time.minute = minute
    }

    static get second () {
      return mp.world.time.second
    }

    static set second (second: number) {
      mp.world.time.second = second
    }

    public static set (hour: number, minute: number, second: number): void {
      mp.world.time.set(hour, minute, second)
    }

    public static randomize (): void {
      Server.Time.set(
        Random.getIntInclusive(0, 23),
        Random.getIntInclusive(0, 59),
        Random.getIntInclusive(0, 59)
      )
    }

    public static add (secondsToAdd: number): void {
      secondsToAdd = Math.floor(secondsToAdd)

      let hour = Server.Time.hour
      let minute = Server.Time.minute
      let second = Server.Time.second + secondsToAdd

      if (second > 59) {
        minute += Math.floor(second / 60)
        second = second % 60

        if (minute > 59) {
          hour += Math.floor(minute / 60)
          minute = minute % 60

          if (hour > 23) {
            hour = hour % 24
          }
        }
      }

      Server.Time.hour = hour
      Server.Time.minute = minute
      Server.Time.second = second
    }

    public static toString () {
      return [
        Server.Time.hour,
        Server.Time.minute,
        Server.Time.second
      ].map((timeValue: number): string => {
        return ('0' + timeValue).slice(-2)
      }).join(':')
    }
  }
}

export default Server
