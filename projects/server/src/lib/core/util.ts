import Types from '@core/types'
import Client from '@lib/client'
import Vehicle from '@lib/vehicle'

export default class Util {
  static isNumeric(n: any): boolean {
    return !isNaN(parseFloat(n)) && isFinite(n)
  }

  static isObject (variable: any) {
    return typeof variable === 'object' && variable !== null
  }

  /**
   * Converts RageMP instances in an array to GTA:OP equivalents
   *
   * @param  ...args Argument list
   * @return         Argument list with Client instance first
   */
  public static convertRageMPInstances (...args: any[]): any[] {
    // Iterate through parameters
    for (let a = 0; a < args.length; a++) {
      // Parameter is PlayerMp -> convert to Client instance
      if (Types.isPlayerMp(args[a])) {
        args[a] = Client.all.byPlayerMp(args[a])
      }

      // Parameter is VehicleMp -> convert to Vehicle instance
      if (Types.isVehicleMp(args[a])) {
        args[a] = Vehicle.all.byVehicleMp(args[a])
      }
    }

    return args
  }
}
