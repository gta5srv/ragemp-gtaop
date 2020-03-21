import Server from '@lib/server';
import * as Manager from '@lib/managers';

export default class Blip {
  private _sprite: number;
  private _position: Vector3Mp;
  private _name?: string;
  private _color: number;
  private _range: number = Blip.DEFAULT_RANGE;
  private _attachedTo?: EntityAdapter;

  public static readonly DEFAULT_BLIP_COLOR: number = 4;
  public static readonly DEFAULT_RANGE: number = Infinity;

  public static readonly all: Manager.Blip = new Manager.Blip();

  constructor (sprite: number, position: Vector3Mp, name?: string,
               color: number = Blip.DEFAULT_BLIP_COLOR) {
    this._sprite = sprite;
    this._position = position;
    this._name = name;
    this._color = color;

    Blip.all.add(this);
    Server.listeners.add(this);
  }

  get sprite () {
    return this._sprite;
  }

  set sprite (sprite) {
    this._sprite = sprite;
  }

  get position () {
    return this._position;
  }

  set position (position) {
    this._position = position;
  }

  get name () {
    return this._name;
  }

  set name (name) {
    this._name = name;
  }

  get color () {
    return this._color;
  }

  set color (color) {
    this._color = color;
  }

  get range () {
    return this._range;
  }

  set range (range) {
    this._range = range;
  }

  get attachedTo () {
    return this._attachedTo;
  }

  set attachedTo (attachedTo) {
    this._attachedTo = attachedTo;
  }

  toJSON () {
    return {
      sprite: this._sprite,
      position: this._position,
      name: this._name,
      color: this._color,
      attachedEntityId: this._attachedTo ? this._attachedTo.mp.id : undefined
    };
  }
}
