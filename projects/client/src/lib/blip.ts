import GTABlip from '@lib/gta-blip';
import Entity from '@lib/entity';
import * as Managers from '@lib/managers';

export default class Blip {
  public readonly mp: BlipMp|null = null;
  public readonly gtaBlip: GTABlip|null = null;

  private _alpha: number;
  private _color: number;

  public static readonly all: Managers.Blip = new Managers.Blip();

  public static readonly DEFAULT_COLOR: number = 0;

  constructor (sprite: number, position: Vector3Mp, color: number = Blip.DEFAULT_COLOR,
               name?: string, attachedToEntity?: EntityMp) {
    if (attachedToEntity) {
      this.gtaBlip = new GTABlip(attachedToEntity, sprite, color, true);
    } else {
      this.mp = mp.blips.new(sprite, position, {
          name: name,
          color: color
      });
    }

    this._color = color;
    this._alpha = 255;

    Blip.all.add(this);
  }

  get alpha () {
    return this._alpha;
  }

  set alpha (alpha) {
    this._alpha = alpha;

    if (this.mp) {
      this.mp.setAlpha(alpha);
    }

    if (this.gtaBlip) {
      this.gtaBlip.alpha = alpha;
    }
  }

  get color () {
    return this._color;
  }

  set color (color) {
    this._color = color;

    if (this.mp) {
      this.mp.setColour(color);
    }

    if (this.gtaBlip) {
      this.gtaBlip.color = color;
    }
  }

  public destroy (): void {
    Blip.all.remove(this);

    if (this.mp) {
      this.mp.destroy();
    }

    if (this.gtaBlip) {
      this.gtaBlip.alpha = 0;
    }
  }
}
