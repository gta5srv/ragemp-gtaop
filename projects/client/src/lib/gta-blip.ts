class GTABlip {
  private _gtaHandle: number;
  private _display: number = 0;

  constructor (entity: EntityMp, sprite: number, color: number = 0, radarOnly: boolean = false) {
    const existingGtaBlip = mp.game.invoke(RageEnums.Natives.Ui.GET_BLIP_FROM_ENTITY, entity.handle);
    if (existingGtaBlip) {
      this._gtaHandle = existingGtaBlip;
      this.alpha = 255;
    } else {
      this._gtaHandle = mp.game.invoke(RageEnums.Natives.Ui.ADD_BLIP_FOR_ENTITY, entity.handle);
    }

    this.sprite = sprite;
    this.color = color;

    if (radarOnly) {
      this.display = GTABlip.Display.RADAR_ONLY;
    }
  }

  get color (): number {
    return mp.game.invoke(RageEnums.Natives.Ui.SET_BLIP_COLOUR, this._gtaHandle);
  }

  set color (color: number) {
    mp.game.invoke(RageEnums.Natives.Ui.SET_BLIP_COLOUR, this._gtaHandle, color);
  }

  get alpha (): number {
    return mp.game.invoke(RageEnums.Natives.Ui.GET_BLIP_ALPHA, this._gtaHandle);
  }

  set alpha (alpha: number) {
    mp.game.invoke(RageEnums.Natives.Ui.SET_BLIP_ALPHA, this._gtaHandle, alpha);
  }

  set sprite (sprite: number) {
    mp.game.invoke(RageEnums.Natives.Ui.SET_BLIP_SPRITE, this._gtaHandle, sprite);
  }

  get sprite (): number {
    return mp.game.invoke(RageEnums.Natives.Ui.GET_BLIP_SPRITE, this._gtaHandle);
  }

  set display (display: number) {
    this._display = display;
    mp.game.invoke(RageEnums.Natives.Ui.SET_BLIP_DISPLAY, this._gtaHandle, display);
  }

  get display (): number {
    return this._display;
  }
}

namespace GTABlip {
  export enum Display {
    RADAR_ONLY=8,
    MAP_ONLY=3,
    MAP_RADAR_SELECT=2
  }
}

export default GTABlip
