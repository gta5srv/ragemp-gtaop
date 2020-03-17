export default class Entity {
  public static fromRemoteId (id: number): EntityMp|null {
    let foundEntity: EntityMp|null = null;

    mp.vehicles.forEach((vehicle: VehicleMp) => {
      if (vehicle.remoteId === id) {
        foundEntity = vehicle;
      }
    });

    return foundEntity;
  }
}
