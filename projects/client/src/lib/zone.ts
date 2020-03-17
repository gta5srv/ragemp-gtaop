import * as Managers from '@lib/managers';
import Vehicle from '@lib/vehicle';
import Blip from '@lib/blip';
import Team from '@lib/team';

export class Zone {
  public static readonly all: Managers.Zone = new Managers.Zone();

  private _slug: string;
  private _name: string;
  private _position: Vector3Mp;
  private _state: Zone.State;
  private _blip: Blip;
  private _owner: Team|null;
  private _vehicles: Managers.Vehicle = new Managers.Vehicle();

  public static readonly DEFAULT_BLIP_SPRITE: number = 38;

  constructor (slug: string, name: string, position: Vector3Mp,
               state: Zone.State, owner: Team|null, vehicles: Vehicle[]) {
    this._slug = slug;
    this._name = name;
    this._position = position;
    this._state = state;
    this._owner = owner;
    this._vehicles.add(...vehicles);

    this._blip = new Blip(
      Zone.DEFAULT_BLIP_SPRITE,
      position,
      owner ? owner.blipColor : undefined,
      name
    );

    Zone.all.add(this);
  }

  get slug () {
    return this._slug;
  }

  get name () {
    return this._name;
  }

  get position () {
    return this._position;
  }

  get state () {
    return this._state;
  }

  set state (state) {
    this._state = state;
  }

  get owner () {
    return this._owner;
  }

  set owner (owner) {
    this._owner = owner;
    this._blip.color = owner ? owner.blipColor : Blip.DEFAULT_COLOR;
    this._vehicles.items.forEach((vehicle: Vehicle) => {
      vehicle.owner = owner;
    })
  }

  get vehicles () {
    return this._vehicles;
  }
}

export namespace Zone {
  export enum State {
    NEUTRAL,
    OWNED,
    CAPTURING,
    NEUTRALIZING
  }
}

export default Zone
