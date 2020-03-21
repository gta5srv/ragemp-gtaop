import * as Manager from '@lib/managers';
import Server from '@lib/server';
import Types from '@core/types';
import Random from '@lib/algebra/random';

export default class Vehicle implements EntityAdapter {
  public readonly mp: VehicleMp;
  private _colors: any;
  private _location: Types.Location;
  private _lastBodyHealth: number;
  private _lastEngineHealth: number;
  private _dead: boolean = false;
  private _respawnable: boolean = true;

  public static all: Manager.Vehicle = new Manager.Vehicle();

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

    this._location = {
      position: position,
      rotation: this.rotation
    };
    this._lastBodyHealth = this.mp.bodyHealth;
    this._lastEngineHealth = this.mp.engineHealth;

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

  get lastBodyHealth () {
    return this._lastBodyHealth;
  }

  set lastBodyHealth (lastBodyHealth) {
    this._lastBodyHealth = lastBodyHealth;
  }

  get lastEngineHealth () {
    return this._lastEngineHealth;
  }

  set lastEngineHealth (lastEngineHealth) {
    this._lastEngineHealth = lastEngineHealth;
  }

  set dead (dead) {
    this._dead = dead;
  }

  get dead () {
    return this._dead;
  }

  get isRespawnable (): boolean {
    return this._respawnable;
  }

  set respawnable (respawnable: boolean) {
    this._respawnable = respawnable;
  }

  public spawn () {
    this.mp.repair();

    this.mp.position = this._location.position;
    this.mp.rotation = this._location.rotation;
  }

  public randomizeColors (): void {
    let colorGroups: number[][] = [];

    while (colorGroups.length < 2) {
      let colors: number[] = [];

      while (colors.length < 3) {
        colors.push(Random.getIntInclusive(0, 255));
      }
      colorGroups.push(colors)
    }

    this.colors = colorGroups;
  }

  toJSON () {
    return {
      id: this.mp.id
    };
  }
}
