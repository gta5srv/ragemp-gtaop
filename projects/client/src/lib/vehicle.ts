import * as Managers from '@lib/managers';
import Team from '@lib/team';
import Blip from '@lib/blip';

export default class Vehicle {
  public static readonly all: Managers.Vehicle = new Managers.Vehicle();

  public readonly mp: VehicleMp;

  private _blip: Blip|null = null;
  private _owner: Team|null = null;

  constructor (vehicleMp: VehicleMp) {
    this.mp = vehicleMp;

    Vehicle.all.add(this);

    mp.events.add('entityStreamIn', (entity: EntityMp) => {
      if (entity.getType() !== 2 || entity.id !== this.mp.id) return;
      this.createBlip();
    });

    mp.events.add('entityStreamOut', (entity: EntityMp) => {
      if (entity.getType() !== 2 || entity.id !== this.mp.id) return;
      this.destroyBlip();
    });
  }

  get owner () {
    return this._owner;
  }

  set owner (owner) {
    this._owner = owner;

    if (this._blip) {
      this._blip.color = owner ? owner.blipColor : Blip.DEFAULT_COLOR;
    }
  }

  public createBlip (): void {
    this._blip = new Blip(
      225,
      new mp.Vector3(0, 0, 0),
      this.owner ? this.owner.blipColor : Blip.DEFAULT_COLOR,
      undefined,
      this.mp
    );
  }

  public destroyBlip (): void {
    this._blip = null;
  }

  // static fromRemoteId (remoteId: number): Vehicle|null {
  //   const vehicleMp = mp.vehicles.atRemoteId(remoteId);
  //   if (vehicleMp) {
  //     return new Vehicle(vehicleMp);
  //   }
  //
  //   return null;
  // }
}
