import List from '@core/list';
import Vehicle from '@lib/vehicle';

export class VehicleManager extends List<Vehicle> {
  byVehicleMp (vehicleMp: VehicleMp): Vehicle | null {
    let foundVehicle = null;

    super.items.forEach((vehicle: Vehicle) => {
      if (vehicle.vehicleMp === vehicleMp) {
        foundVehicle = vehicle;
        return false;
      }
    });

    return foundVehicle;
  }

  idArray (): number[] {
    return super.items.map((vehicle: Vehicle) => {
      return vehicle.mp.id;
    });
  }
}
