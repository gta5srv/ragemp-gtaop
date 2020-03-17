import Server from '@lib/server';
import * as Listeners from '@lib/listeners';
import Client from '@lib/client';
import Blip from '@lib/blip';

export default class BlipStreamer implements Listeners.TickListener {
  private static readonly TICK_LIMIT: number = 5;

  private _tickCount: number = 0;

  constructor () {
    Server.listeners.add(this);
  }

  onTick(msElapsed: number): void {
    if (this._tickCount++ % BlipStreamer.TICK_LIMIT !== 0) {
      return;
    }

    // console.log('blip streamer tick');

    Client.all.items.forEach((client: Client) => {
      let blips: Blip[] = [];

      Blip.all.items.forEach((blip: Blip) => {
        if (blip.range === Infinity || client.mp.dist(blip.position) <= blip.range) {
          blips.push(blip);
        }
      });

      // console.log(JSON.stringify(blips));
      client.call('blipsUpdate', [JSON.stringify(blips)]);
    })
  }
}
