import Vehicle from '@lib/vehicle'

const extend = require('extend')

export default class Team {
  constructor (options) {
    let config = extend(true, {}, {
      name: '',
      slug: '',
      base: null,
      blipColorID: 0,
      vehicleColors: [[ 0, 0, 0 ], [ 0, 0, 0 ]],
      models: [],
      spawns: [],
      vehicles: []
    }, options)

    this._name = config.name
    this._slug = config.slug
    this._base = config.base,
    this._blipColorID = config.blipColorID
    this._vehicleColors = config.vehicleColors
    this._models = config.models
    this._spawns = config.spawns

    this._init()
    this._createVehicles(config.vehicles)
  }

  get name () {
    return this._name
  }

  get slug () {
    return this._slug
  }

  _init () {
    if (this._base) {
      this.blip = mp.blips.new(40, this._base, {
        name: this._name + ' base',
        color: this._blipColorID
      })
    }
  }

  _createVehicles (vehicleInfoList) {
    this._vehicles = []

    if (!(vehicleInfoList && vehicleInfoList.length)) {
      return
    }

    vehicleInfoList.forEach(vehicleGroup => {
      vehicleGroup.forEach(vehicleInfo => {
        vehicleInfo.spawns.forEach(vehicleSpawn => {
          this._vehicles.push(new Vehicle({
            model: vehicleInfo.modelName,
            position: vehicleSpawn.position,
            rotation: vehicleSpawn.rotation,
            numberPlate: this._name.toUpperCase(),
            colors: this._vehicleColors
          }))
        })
      })
    })
  }

  getSpawn () {
    let spawnIndex = Math.floor(Math.random() * this._spawns.length)
    return this._spawns[spawnIndex]
  }
}
