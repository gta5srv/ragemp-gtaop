import Vehicle from '@lib/vehicle'

const extend = require('extend')

export default class Team {
  _name = ''
  _slug = ''
  _base = null
  _blip = null // Base blip
  _marker = null // Base marker
  _blipColorID = 0
  _vehicleColors = [[ 0, 0, 0 ], [ 0, 0, 0 ]]
  _models = []
  _spawns = []

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
      this._blip = mp.blips.new(40, this._base, {
        name: this._name + ' base',
        color: this._blipColorID
      })

      this._label = mp.labels.new(
        `${this._name.toUpperCase()} base menu`,
        new mp.Vector3(this._base.x, this._base.y, this._base.z + 0.6), {
          font: 4,
          drawDistance: 200,
          color: [ 255, 0, 0, 255 ]
        })

      this._label.los = false

      this._checkpoint = mp.markers.new(1, this._base, 3, {
        direction: this._base,
        color: [ 255, 0, 0, 255 ],
        visible: 1,
        dimension: 0
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

  setupClient (client) {
    const modelIndex = Math.floor(Math.random() * this._models.length)
    client.model = mp.joaat(this._models[modelIndex])
  }

  getSpawn () {
    let spawnIndex = Math.floor(Math.random() * this._spawns.length)
    return this._spawns[spawnIndex]
  }
}
