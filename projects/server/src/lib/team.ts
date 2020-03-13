import Types from '@core/types';
import List from '@core/list'
import Client from '@lib/client'
import Vehicle from '@lib/vehicle'
import * as Manager from '@lib/managers'

export class Team {
  private _name: string
  private _slug: string
  private _base: Vector3Mp
  private _blipColor: number
  private _vehicleColors: [RGB, RGB]
  private _models: Array<string> = []
  private _spawns: Array<any> = [] // TODO: Adjust type
  private _vehicles: Team.VehicleGroupManager
  private _blip: BlipMp | null = null
  private _label: TextLabelMp | null = null
  private _checkpoint: MarkerMp | null = null

  private static readonly DEFAULT_BLIP_COLOR: number = 0
  private static readonly DEFAULT_VEHICLE_COLORS: [RGB, RGB] = [[ 0, 0, 0 ], [ 0, 0, 0 ]]

  public static all: Manager.Team = new Manager.Team()

  constructor (name: string, slug: string, base: Vector3Mp,
               blipColor: number = Team.DEFAULT_BLIP_COLOR,
               vehicleColors: [RGB, RGB] = Team.DEFAULT_VEHICLE_COLORS,
               models: string[] = [], spawns: any[] = [],
               vehicles: Team.VehicleGroupManager = new Team.VehicleGroupManager()) {
    this._name = name
    this._slug = slug
    this._base = base
    this._blipColor = blipColor
    this._vehicleColors = vehicleColors
    this._models = models
    this._spawns = spawns
    this._vehicles = vehicles

    this._init()

    Team.all.add(this)
  }

  get name () {
    return this._name
  }

  get slug () {
    return this._slug
  }

  _init (): void {
    // TODO: Implement proper classes
    this._blip = mp.blips.new(40, this._base, {
      name: this._name + ' base',
      color: this._blipColor
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
      dimension: 0
    })
    this._checkpoint.visible = true

    this._vehicles.items.forEach((vehicleGroup: Team.VehicleGroup) => {
      vehicleGroup.spawns.forEach((spawn: Types.Location) => {
        new Vehicle(vehicleGroup.model, spawn.position, spawn.rotation, this._vehicleColors, this._name.toUpperCase())
      })
    })
  }

  setupClient (client: Client): void {
    const modelIndex = Math.floor(Math.random() * this._models.length)
    client.model = mp.joaat(this._models[modelIndex])
  }

  getSpawn (): any { // TODO: Change type
    const spawnIndex = Math.floor(Math.random() * this._spawns.length)
    return this._spawns[spawnIndex]
  }
}

export namespace Team {
  export interface VehicleGroup {
    model: string
    name: string
    spawns: Types.Location[]
    price?: number
  }

  export class VehicleGroupManager extends List<Team.VehicleGroup> {
  }
}

export default Team
