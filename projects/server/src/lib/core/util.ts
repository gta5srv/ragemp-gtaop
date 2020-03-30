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

  static isTypeArray <T> (array: Array<any>, typeString: string): boolean {
    return array.every((a: any) => typeof a === typeString)
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

  public static rgbToHex (r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  public static isEmail (text: string) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(text).toLowerCase());
  }
}
