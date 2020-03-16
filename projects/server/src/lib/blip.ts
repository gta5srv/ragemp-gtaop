import List from "@core/list";
import * as Manager from '@lib/managers'

export default class Blip {
  private _mp: BlipMp;

  public static readonly DEFAULT_BLIP_COLOR: number = 4;

  public static readonly all: Manager.Blip = new Manager.Blip();

  constructor (model: number, position: Vector3Mp, name: string,
               color: number = Blip.DEFAULT_BLIP_COLOR) {
    this._mp = mp.blips.new(model, position, {
      name: name,
      color: color
    });

    Blip.all.add(this);
  }

  get mp () {
    return this._mp;
  }

  get color () {
    return this._mp.color;
  }

  set color (color) {
    this._mp.color = color;
  }
}
