import GTABlip from '@lib/gta-blip';
import Entity from '@lib/entity';
import * as Managers from '@lib/managers';

export default class Blip {
  public readonly mp: BlipMp|null = null;

  private _attachedToEntity?: EntityMp;
  private _gtaBlip: GTABlip|null = null;

  public static readonly all: Managers.Blip = new Managers.Blip();

  public static readonly DEFAULT_COLOR: number = 0;

  constructor (sprite: number, position: Vector3Mp, color: number = Blip.DEFAULT_COLOR,
               name?: string, attachedToEntity?: EntityMp) {
    if (attachedToEntity) {
      this._gtaBlip = new GTABlip(attachedToEntity, sprite, color);
    } else {
      this.mp = mp.blips.new(sprite, position, {
          name: name,
          color: color
      });
    }

    Blip.all.add(this);
  }

  get gtaBlip () {
    return this._gtaBlip;
  }

  get color (): number {
    return this.mp ? this.mp.getColour() : (this._gtaBlip ? this._gtaBlip.color : Blip.DEFAULT_COLOR);
  }

  set color (color) {
    if (this.mp) {
      this.mp.setColour(color);
    }

    if (this._gtaBlip) {
      this._gtaBlip.color = color;
    }
  }

  public destroy (): void {
    Blip.all.remove(this);

    if (this.mp) {
      this.mp.destroy();
    }
  }
}
