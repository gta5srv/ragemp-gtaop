import Types from '@core/types';
import List from '@core/list';
import Util from '@core/util';
import Client from '@lib/client';
import Vehicle from '@lib/vehicle';
import Blip from '@lib/blip';
import * as Manager from '@lib/managers';

export class Team {
  private _name: string;
  private _slug: string;
  private _base: Vector3Mp;
  private _color: RGB;
  private _vehicleColors: [RGB, RGB];
  private _gtaColor: string = Team.DEFAULT_GTA_COLOR;
  private _models: Array<string>;
  private _spawns: Array<any>; // TODO: Adjust type
  private _vehicles: Manager.Vehicle = new Manager.Vehicle();
  private _vehicleGroups: Team.VehicleGroupManager;
  private _blip: Blip;
  private _blipColor: number;
  private _label: TextLabelMp | null = null;
  private _checkpoint: MarkerMp | null = null;

  private static readonly DEFAULT_BLIP_COLOR: number = 0;
  private static readonly DEFAULT_MARKER_COLOR: RGB = [ 255, 255, 255 ];
  private static readonly DEFAULT_VEHICLE_COLORS: [RGB, RGB] = [[ 0, 0, 0 ], [ 0, 0, 0 ]];
  private static readonly DEFAULT_GTA_COLOR: string = '~u~';

  public static all: Manager.Team = new Manager.Team();

  constructor (name: string, slug: string, base: Vector3Mp,
               blipColor: number = Team.DEFAULT_BLIP_COLOR,
               color: RGB = Team.DEFAULT_MARKER_COLOR,
               vehicleColors: [RGB, RGB] = Team.DEFAULT_VEHICLE_COLORS,
               models: string[] = [], spawns: any[] = [],
               vehicles: Team.VehicleGroupManager = new Team.VehicleGroupManager()) {
    this._name = name;
    this._slug = slug;
    this._base = base;
    this._color = color;
    this._vehicleColors = vehicleColors;
    this._models = models;
    this._spawns = spawns;
    this._vehicleGroups = vehicles;

    this._blip = new Blip(40, this._base, this._name + ' base', blipColor);
    this._blipColor = blipColor;

    this.init();

    Team.all.add(this);
  }

  get name () {
    return this._name;
  }

  get slug () {
    return this._slug;
  }

  get color () {
    return this._color;
  }

  get blip () {
    return this._blip;
  }

  get blipColor () {
    return this._blipColor;
  }

  get colorHex (): string {
    return Util.rgbToHex(...this._color);
  }

  get vehicleColors () {
    return this._vehicleColors;
  }

  get gtaColor () {
    return this._gtaColor;
  }

  set gtaColor (gtaColor) {
    this._gtaColor = gtaColor;
  }

  get vehicles () {
    return this._vehicles;
  }

  get isFull () {
    return false;
  }

  get isBoosted () {
    return false;
  }

  private init (): void {
    // TODO: Implement proper class
    this._label = mp.labels.new(
      `${this._name.toUpperCase()} base menu`,
      new mp.Vector3(this._base.x, this._base.y, this._base.z + 0.6), {
        font: 4,
        drawDistance: 200,
        color: [ 255, 0, 0, 255 ]
      });
    this._label.los = false;

    // TODO: Implement proper class
    this._checkpoint = mp.markers.new(RageEnums.Marker.VERTICAL_CYLINDER, this._base, 3, {
      direction: this._base,
      color: [ 255, 0, 0, 255 ],
      dimension: 0
    });
    this._checkpoint.visible = true;

    this._vehicleGroups.items.forEach((vehicleGroup: Team.VehicleGroup) => {
      vehicleGroup.spawns.forEach((spawn: Types.Location) => {
        this._vehicles.add(
          new Vehicle(
            vehicleGroup.model,
            spawn.position,
            spawn.rotation,
            this._vehicleColors,
            this._name.toUpperCase()
          )
        );
      });
    });
  }


  public setupClient (client: Client): void {
    const modelIndex = Math.floor(Math.random() * this._models.length);
    client.model = mp.joaat(this._models[modelIndex]);
  }


  public getSpawn (): any { // TODO: Change type
    const spawnIndex = Math.floor(Math.random() * this._spawns.length);
    return this._spawns[spawnIndex];
  }


  public toString (): string {
    return `(Team "${this.name}" <${this.slug}>)`;
  }


  public toJSON () {
    return {
      slug: this.slug,
      name: this.name,
      blipColor: this.blipColor,
      vehicleIds: this.vehicles.idArray()
    };
  }
}

export namespace Team {
  export interface VehicleGroup {
    model: string;
    name: string;
    spawns: Types.Location[];
    price?: number;
  }

  export class VehicleGroupManager extends List<Team.VehicleGroup> {
  }
}

export default Team;
