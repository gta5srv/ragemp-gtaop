import List from '@core/list'
import Vehicle from '@lib/vehicle'

export class VehicleManager extends List<Vehicle> {
  byVehicleMp(vehicleMp: VehicleMp): Vehicle | null {
    let foundVehicle = null

    super.items.forEach((vehicle: Vehicle) => {
      if (vehicle.mp === vehicleMp) {
        foundVehicle = vehicle
        return false
      }
    })

    return foundVehicle
  }

  byRemoteId (remoteId: number): Vehicle | null {
    let foundVehicle = null

    super.items.forEach((vehicle: Vehicle) => {
      if (vehicle.mp.remoteId === remoteId) {
        foundVehicle = vehicle
        return false
      }
    })

    return foundVehicle
  }
}
