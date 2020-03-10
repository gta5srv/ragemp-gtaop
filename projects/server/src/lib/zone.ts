import Marker from '@lib/marker'

export default class Zone {
  private _name: string
  private _position: Vector3Mp
  private _radius: number
  private _blip: BlipMp
  private _marker: MarkerMp

  private static readonly DEFAULT_RADIUS: number = 5
  private static readonly DEFAULT_BLIP_MODEL: number = 38

  constructor (name: string, position: Vector3Mp, group?: string, radius: number = Zone.DEFAULT_RADIUS,
               blipModel: number = Zone.DEFAULT_BLIP_MODEL) {

    this._name = name
    this._position = position
    this._radius = radius
    this._blip = mp.blips.new(blipModel, position, {
      name: name,
      color: 4
    })
    this._marker = mp.markers.new(Marker.Type.VerticalCylinder, position, radius)
  }

  get name () {
    return this._name
  }

  get position () {
    return this._position
  }

  get radius () {
    return this._radius
  }

  get blip () {
    return this._blip
  }

  get marker () {
    return this._marker
  }
}
