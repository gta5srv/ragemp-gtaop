import * as Manager from '@lib/managers';
import Server from '@lib/server';
import Blip from '@lib/blip';

export default class Vehicle implements EntityAdapter {
  public readonly mp: VehicleMp;
  private _colors: any
  // private _blip: Blip

  public static all: Manager.Vehicle = new Manager.Vehicle()

  constructor (model: HashOrString,
               position: Vector3Mp, rotation: Vector3Mp | null = null,
               colors?: [RGB,RGB], numberPlate?: string) {
    this.mp = mp.vehicles.new(model, position, {});

    if (rotation) {
      this.mp.rotation = rotation;
    }

    if (colors) {
      this.colors = colors;
    }

    if (numberPlate) {
      this.mp.numberPlate = numberPlate;
    }

    // this._blip = new Blip(225, new mp.Vector3(0, 0, 0));
    // this._blip.attachedTo = this;

    Vehicle.all.add(this);
    Server.listeners.triggerVehicleAdded(this);
  }

  get vehicleMp () {
    return this.mp;
  }

  get colors () {
    return this._colors;
  }

  set colors (colors) {
    this._colors = colors;

    const colorsArray: any = [].concat(...colors);
    this.mp.setColorRGB.apply(this.mp, colorsArray);
  }

  get rotation (): Vector3Mp {
    const { x, y, z } = this.mp.rotation;
    const rx = (360 - z) / 180 * Math.PI;
    const ry = z / 180 * Math.PI;

    return new mp.Vector3(
        x * -Math.cos(rx) + y * Math.sin(rx),
        y * -Math.cos(ry) + x * Math.sin(ry),
        z
    );
  }

  set rotation (rotation: Vector3Mp) {
    this.mp.rotation = rotation;
  }

  set position (position: Vector3Mp) {
    this.mp.position = position;
  }

  get position () {
    return this.mp.position;
  }

  toJSON () {
    return {
      id: this.mp.id
    };
  }
}
