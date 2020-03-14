import Server from '@lib/server'
import Marker from '@lib/marker'
import Team from '@lib/team'
import Client from '@lib/client'
import Spawnable from '@lib/interfaces/spawnable'
import * as Manager from '@lib/managers'
import * as Listeners from '@lib/listeners'
import Types from '@core/types';

export default class Zone extends Spawnable implements Listeners.ZoneListener/*, Listeners.TickListener */{
  private _name: string
  private _slug: string
  private _position: Vector3Mp
  private _radius: number
  private _blip: BlipMp
  private _marker: MarkerMp
  private _colshape: ColshapeMp
  private _owner?: Team

  public static readonly DEFAULT_RADIUS: number = 5
  public static readonly DEFAULT_BLIP_MODEL: number = 38
  public static readonly DEFAULT_BLIP_COLOR: 4

  public static readonly all: Manager.Zone = new Manager.Zone()
  public readonly vehicles: Manager.Vehicle = new Manager.Vehicle()

  constructor (name: string, slug: string,
               position: Vector3Mp, spawns: Types.Location[] = [],
               group?: string,
               radius: number = Zone.DEFAULT_RADIUS,
               blipModel: number = Zone.DEFAULT_BLIP_MODEL) {
    super();

    this._name = name;
    this._slug = slug;
    this._position = position;
    this._radius = radius;
    this._blip = mp.blips.new(blipModel, position, {
      name: name,
      color: Zone.DEFAULT_BLIP_COLOR
    });
    this._marker = mp.markers.new(Marker.Type.VerticalCylinder, position, radius);
    this._marker.setColor(255, 255, 255, 60)
    this._colshape = mp.colshapes.newSphere(position.x, position.y, position.z, radius);

    super.spawns = spawns;

    Zone.all.add(this);
    Server.listeners.add(this);
  }

  get name () {
    return this._name;
  }

  get slug () {
    return this._slug
  }

  get position () {
    return this._position;
  }

  get radius () {
    return this._radius;
  }

  get blip () {
    return this._blip;
  }

  get marker () {
    return this._marker;
  }

  get colshape () {
    return this._colshape;
  }

  public onZoneEnter(client: Client): void {
    console.log('enter', client.name);
  }

  public onZoneExit(client: Client): void {
    console.log('exit', client.name);
  }

  public onTick(msElapsed: number): void {
  }
}
