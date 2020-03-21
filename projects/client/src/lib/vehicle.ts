import * as Managers from '@lib/managers';
import Team from '@lib/team';
import Blip from '@lib/blip';

class Vehicle {
  public readonly mp: VehicleMp;

  private _blip: Blip|null = null;
  private _owner: Team|null = null;
  private _hiddenOnMap: boolean = false;

  public static readonly BLIP_SPRITES = {
    default: 225,
    motorcycle: 226,
    helicopter: 43,
    plane: 16,
    boat: 427
  };

  public static readonly all: Managers.Vehicle = new Managers.Vehicle();

  constructor (vehicleMp: VehicleMp) {
    this.mp = vehicleMp;

    this.registerEvents();

    Vehicle.all.add(this);
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

  get blip () {
    return this._blip;
  }

  get hiddenOnMap () {
    return this._hiddenOnMap;
  }

  set hiddenOnMap (hiddenOnMap) {
    this._hiddenOnMap = hiddenOnMap;

    if (this._blip) {
      this._blip.alpha = hiddenOnMap ? 0 : 255;
    }
  }

  private registerEvents () {
    mp.events.add('entityStreamIn', (entity: EntityMp) => {
      if (entity.getType() !== 2 || entity.id !== this.mp.id) return;
      this.createBlip();
    });

    mp.events.add('entityStreamOut', (entity: EntityMp) => {
      if (entity.getType() !== 2 || entity.id !== this.mp.id) return;
      this.destroyBlip();
    });
  }

  private getBlipSprite () {
    switch (this.mp.getClass()) {
      case Vehicle.Classes.Motorcycles:
        return Vehicle.BLIP_SPRITES.motorcycle;
      case Vehicle.Classes.Helicopters:
        return Vehicle.BLIP_SPRITES.helicopter;
      case Vehicle.Classes.Planes:
        return Vehicle.BLIP_SPRITES.plane;
      case Vehicle.Classes.Boats:
        return Vehicle.BLIP_SPRITES.boat;
      default:
        return Vehicle.BLIP_SPRITES.default;
    }
  }

  public createBlip (): void {
    this._blip = new Blip(
      this.getBlipSprite(),
      new mp.Vector3(0, 0, 0),
      this.owner ? this.owner.blipColor : Blip.DEFAULT_COLOR,
      undefined,
      this.mp
    );

    this._blip.alpha = this.hiddenOnMap ? 0 : 255;
  }

  public destroyBlip (): void {
    this._blip = null;
  }

  public onVehicleSpawn (): void {
    this.hiddenOnMap = false;
  }

  public onVehicleDeath (): void {
    this.hiddenOnMap = true;
  }
}

namespace Vehicle {
  export enum Classes {
    Compacts,
    Sedans,
    SUVs,
    Coupes,
    Muscle,
    SportsClassics,
    Sports,
    Super,
    Motorcycles,
    OffRoad,
    Industrial,
    Utility,
    Vans,
    Cycles,
    Boats,
    Helicopters,
    Planes,
    Service,
    Emergency,
    Military,
    Commercial,
    Trains
  }
}

export default Vehicle
