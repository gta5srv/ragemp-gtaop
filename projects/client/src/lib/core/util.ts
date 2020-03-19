import Types from '@core/types'
import Vehicle from '@lib/vehicle'

export default class Util {
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
      // Parameter is VehicleMp -> convert to Vehicle instance
      if (Types.isVehicleMp(args[a])) {
        args[a] = Vehicle.all.byVehicleMp(args[a])
      }
    }

    return args
  }
}
