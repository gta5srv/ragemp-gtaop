import Blip from '@lib/blip';
import List from '@core/list';

class BlipStreamer {
  public static readonly all: List<Blip> = new List();

  constructor () {
    mp.events.add('blipsUpdate', (blipsData: string) => {
      this.update(JSON.parse(blipsData));
    });
  }

  update (blipInfos: any): void {
    BlipStreamer.all.items.forEach((blip: Blip) => {
      BlipStreamer.all.remove(blip);
      blip.destroy();
    });

    blipInfos.forEach((blipInfo: BlipStreamer.BlipInfo) => {
      let attachedToEntity;

      if (blipInfo.attachedEntityId) {
        attachedToEntity = mp.vehicles.atRemoteId(blipInfo.attachedEntityId);
      }

      BlipStreamer.all.add(
        new Blip(
          blipInfo.sprite,
          new mp.Vector3(
            blipInfo.position.x,
            blipInfo.position.y,
            blipInfo.position.z
          ),
          blipInfo.color,
          blipInfo.name,
          attachedToEntity
        )
      );
    });
  }
}

namespace BlipStreamer {
  export interface BlipInfo {
    sprite: number;
    position: any;
    name?: string;
    color: number;
    attachedEntityId?: number;
    flashing: boolean;
    flashingColor?: number;
    flashingSprite?: number;
  }
}

export default BlipStreamer
