export default class Vehicle {
  _vehicle:VehicleMp
  _colors:any

  constructor (vehicle:any) {
    this._vehicle = mp.vehicles.new(vehicle.model, vehicle.position, {
    })

    if (vehicle.numberPlate) {
      this._vehicle.numberPlate = vehicle.numberPlate
    }

    if (vehicle.colors) {
      this.colors = vehicle.colors
    }

    if (vehicle.rotation) {
      this._vehicle.rotation = vehicle.rotation
    }
  }

  get colors () {
    return this._colors
  }

  set colors (colors) {
    this._colors = colors

    const colorsArray: any = [].concat(...colors)
    this._vehicle.setColorRGB.apply(this._vehicle, colorsArray)
  }

  get rotation (): Vector3Mp {
    const { x, y, z } = this._vehicle.rotation
    const rx = (360 - z) / 180 * Math.PI
    const ry = z / 180 * Math.PI

    return new mp.Vector3(
        x * -Math.cos(rx) + y * Math.sin(rx),
        y * -Math.cos(ry) + x * Math.sin(ry),
        z
    )
  }

  set rotation (rotation: Vector3Mp) {
    this._vehicle.rotation = rotation
  }

  set position (position: Vector3Mp) {
    this._vehicle.position = position
  }

  get position () {
    return this._vehicle.position
  }
}
