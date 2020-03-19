import Listener from './listener'
import Vehicle from '@lib/vehicle'

interface VehicleListener extends Listener<Vehicle> {
  onVehicleAdd(vehicle: Vehicle): void;
  onVehicleDeath(vehicle: Vehicle): void;
  onVehicleDamage(vehicle: Vehicle, bodyHealthLoss: number, engineHealthLoss: number): void;
}

function isVehicleListener(listener: Listener<any>): listener is VehicleListener {
  return 'onVehicleAdd' in listener;
}

export {
  VehicleListener,
  isVehicleListener
}
