export default class Vehicle {
  constructor (vehicle) {
    if (!(vehicle instanceof mp.Vehicle)) {
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
    } else {
      this._vehicle = vehicle
    }
  }

  set colors (colors) {
    const colorsArray = [].concat(...colors)
    this._vehicle.setColorRGB.apply(this._vehicle, colorsArray)
  }

  get rotation () {
    const { x, y, z } = this._vehicle.rotation
    const rx = (360 - z) / 180 * Math.PI
    const ry = z / 180 * Math.PI

    return {
        x: x * -Math.cos(rx) + y * Math.sin(rx),
        y: y * -Math.cos(ry) + x * Math.sin(ry),
        z
    }
  }
}
