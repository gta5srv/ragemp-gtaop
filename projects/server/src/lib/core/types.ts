import Util from '@core/util'

namespace Types {
  export function isPlayerMp(v: any): v is PlayerMp {
    return Util.isObject(v) && 'ip' in v
  }

  export function isVehicleMp(v: any): v is VehicleMp {
    return Util.isObject(v) && 'numberPlate' in v
  }

  export interface Location {
    position: Vector3Mp,
    rotation: Vector3Mp
  }
}

export default Types
