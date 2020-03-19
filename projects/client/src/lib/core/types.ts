import Util from '@core/util'

namespace Types {
  export function isVehicleMp(v: any): v is VehicleMp {
    return Util.isObject(v) && 'getNumberPlateText' in v
  }
}

export default Types
