import Vehicle from '@lib/vehicle'
import Manager from '@core/manager'

export class VehicleManager extends Manager<Vehicle> {
  byVehicleMp(vehicleMp: VehicleMp): Vehicle | null {
    let foundVehicle = null

    super.items.forEach((vehicle: Vehicle) => {
      if (vehicle.vehicleMp === vehicleMp) {
        foundVehicle = vehicle
        return false
      }
    })

    return foundVehicle
  }
}
