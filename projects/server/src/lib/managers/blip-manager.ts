import List from '@core/list';
import Blip from '@lib/blip';

export class BlipManager extends List<Blip> {
   byBlipMp (blipMp: BlipMp): Blip | null {
     let foundBlip = null

     super.items.forEach((blip: Blip) => {
       if (blip.mp == blipMp) {
         foundBlip = blip
       }
     })

     return foundBlip
   }
}
