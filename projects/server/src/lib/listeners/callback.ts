import * as Listeners from './'
import { Listener } from './'
import Config from '@root/config'
import Loop from '@core/loop';
import List from '@core/list'
import Util from '@core/util'
import Client from '@lib/client'
import Zone from '../zone';

export default class Callback extends List<Listener<any>> {
  private _loop: Loop = new Loop(Config.TICK_RATE, this.tick, this)

  constructor () {
    super()

    this.init()
    this.register()
  }

  get subscribers () {
    return this.items
  }

  get loop () {
    return this._loop
  }

  public addEvent (event: string,
                   subscriberCheckCb: (subscriber: Listener<any>) => boolean,
                   callback: Function, stripFirstParameter: boolean = true): void {
    mp.events.add(event, (...args: any[]) => {
      this.subscribers.forEach((subscriber: Listener<any>) => {
        if (!subscriberCheckCb(subscriber)) {
          return true;
        }

        let params = Util.convertRageMPInstances(...args);

        if (subscriberCheckCb === Listeners.isClientListener) {
          if (params[0] instanceof Client && params[0] != subscriber) {
            return true;
          }

          params.shift(); // Strip first argument
        }

        // Prepend issueing subscriber to parameters
        params.unshift(subscriber);
        callback(...params);
      });
    });
  }

  private init (): void {
    mp.events.add('playerJoin', (player: PlayerMp) => {
      new Client(player);
    });

    mp.events.add('playerQuit', (player: PlayerMp) => {
      Client.all.removeByPlayerMp(player);
    });
  }

  private register (): void {
    this.addEvent('playerReady', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener) => {
      subscriber.onClientReady();
    });

    this.addEvent('playerDeath', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener, reason: number, killer: Client) => {
      subscriber.onClientDeath(reason, killer);
    });

    this.addEvent("playerChat", Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener, text: string) => {
      subscriber.onClientChat(text);
    });

    this.addEvent('playerEnterColshape', Listeners.isZoneListener,
                  (zone: Zone, client: Client, colshape: ColshapeMp) => {
      if (zone.colshape === colshape) {
        zone.onZoneEnter(client);
      }
    }, false);

    this.addEvent('playerExitColshape', Listeners.isZoneListener,
                  (zone: Zone, client: Client, colshape: ColshapeMp) => {
      if (zone.colshape === colshape) {
        zone.onZoneExit(client);
      }
    }, false);

    this.addEvent('playerCreateWaypoint', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener, position: string) => {
      let coords = JSON.parse(position)
      subscriber.onClientCreateWaypoint(coords.x, coords.y)
    })
  }

  public tick (msElapsed: number): void {
    this.subscribers.forEach((subscriber: Listener<any>) => {
      if (Listeners.isTickListener(subscriber)) {
        subscriber.onTick(msElapsed)
      }
    })
  }
}
