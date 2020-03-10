import Server from '@core/server'

export default class Vehicle {
  private _vehicleMp: VehicleMp
  private _colors: any

  constructor (model: HashOrString, position: Vector3Mp, rotation: Vector3Mp | null = null,
               colors?: [RGB,RGB], numberPlate?: string) {
    this._vehicleMp = mp.vehicles.new(model, position, {})

    if (rotation) {
      this._vehicleMp.rotation = rotation
    }

    if (colors) {
      this.colors = colors
    }

    if (numberPlate) {
      this._vehicleMp.numberPlate = numberPlate
    }

    Server.vehicles.add(this)
  }

  static byVehicleMp(vehicleMp: VehicleMp): Vehicle | null {
    return Server.vehicles.byVehicleMp(vehicleMp)
  }

  get vehicleMp () {
    return this._vehicleMp
  }

  get colors () {
    return this._colors
  }

  set colors (colors) {
    this._colors = colors

    const colorsArray: any = [].concat(...colors)
    this._vehicleMp.setColorRGB.apply(this._vehicleMp, colorsArray)
  }

  get rotation (): Vector3Mp {
    const { x, y, z } = this._vehicleMp.rotation
    const rx = (360 - z) / 180 * Math.PI
    const ry = z / 180 * Math.PI

    return new mp.Vector3(
        x * -Math.cos(rx) + y * Math.sin(rx),
        y * -Math.cos(ry) + x * Math.sin(ry),
        z
    )
  }

  set rotation (rotation: Vector3Mp) {
    this._vehicleMp.rotation = rotation
  }

  set position (position: Vector3Mp) {
    this._vehicleMp.position = position
  }

  get position () {
    return this._vehicleMp.position
  }
}
