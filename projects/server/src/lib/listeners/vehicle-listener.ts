import Listener from './listener'
import Vehicle from '@lib/vehicle'

interface VehicleListener extends Listener<Vehicle> {
  onVehicleAdd(vehicle: Vehicle): void
  onVehicleDeath(client: Vehicle): void
}

function isVehicleListener(listener: Listener<any>): listener is VehicleListener {
  return 'onVehicleAdd' in listener
}

export {
  VehicleListener,
  isVehicleListener
}
