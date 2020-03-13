import Server from '@lib/server'
import Marker from '@lib/marker'
import Team from '@lib/team'
import Client from '@lib/client'
import * as Manager from '@lib/managers'
import * as Listeners from '@lib/listeners'

export default class Zone implements Listeners.ZoneListener, Listeners.TickListener {
  private _name: string
  private _position: Vector3Mp
  private _radius: number
  private _blip: BlipMp
  private _marker: MarkerMp
  private _colshape: ColshapeMp
  private _owner?: Team

  private static readonly DEFAULT_RADIUS: number = 5
  private static readonly DEFAULT_BLIP_MODEL: number = 38
  private static readonly DEFAULT_BLIP_COLOR: 4

  public static all: Manager.Zone = new Manager.Zone()

  constructor (name: string, position: Vector3Mp, group?: string,
               radius: number = Zone.DEFAULT_RADIUS,
               blipModel: number = Zone.DEFAULT_BLIP_MODEL) {
    this._name = name
    this._position = position
    this._radius = radius
    this._blip = mp.blips.new(blipModel, position, {
      name: name,
      color: Zone.DEFAULT_BLIP_COLOR
    })
    this._marker = mp.markers.new(Marker.Type.VerticalCylinder, position, radius)
    this._colshape = mp.colshapes.newSphere(position.x, position.y, position.z, radius)

    Zone.all.add(this)
    Server.listeners.add(this)
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

  get colshape () {
    return this._colshape
  }

  public onZoneEnter(client: Client): void {
    console.log('enter', client.name)
  }

  public onZoneExit(client: Client): void {
    console.log('exit', client.name)
  }

  public onTick(msElapsed: number): void {
  }
}
