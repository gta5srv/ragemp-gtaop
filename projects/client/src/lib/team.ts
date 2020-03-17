import * as Managers from '@lib/managers';
import Vehicle from '@lib/vehicle';

export default class Team {
  private _slug: string;
  private _name: string;
  private _blipColor: number;
  private _vehicles: Managers.Vehicle = new Managers.Vehicle();

  public static readonly all: Managers.Team = new Managers.Team();

  constructor (slug: string, name: string, blipColor: number, vehicles: Vehicle[]) {
    this._slug = slug;
    this._name = name;
    this._blipColor = blipColor;
    this._vehicles.add(...vehicles.map((vehicle: Vehicle) => {
      vehicle.owner = this;
      return vehicle;
    }));

    Team.all.add(this);
  }

  get slug () {
    return this._slug;
  }

  get name () {
    return this._name;
  }

  get blipColor () {
    return this._blipColor;
  }

  get vehicles () {
    return this._vehicles;
  }
}
