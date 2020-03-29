import * as Listeners from './';
import { Listener } from './';
import Loop from '@core/loop';
import List from '@core/list'
import Util from '@core/util'
import Vehicle from '@lib/vehicle';
import Client from '@lib/client';

export default class Callback extends List<Listener<any>> {
  private _loop: Loop = new Loop(50, this.tick, this)

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

        // if (subscriberCheckCb === Listeners.isVehicleListener) {
        //   if (params[0] instanceof Vehicle && params[0] != subscriber) {
        //     return true;
        //   }
        // }

        // Prepend issueing subscriber to parameters
        params.unshift(subscriber);
        callback(...params);
      });
    });
  }

  private init (): void {
    // mp.events.add('playerJoin', (player: PlayerMp) => {
    //   new Client(player);
    // });
    //
    // mp.events.add('playerQuit', (player: PlayerMp) => {
    //   Client.all.removeByPlayerMp(player);
    // });
  }

  private register (): void {
    this.addEvent('OP.playerEnterVehicle', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener, vehicle: Vehicle) => {
      subscriber.onEnterVehicle(vehicle);
    });

    this.addEvent('OP.playerExitVehicle', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener, vehicle: Vehicle) => {
      subscriber.onExitVehicle(vehicle);
    });

    this.addEvent('OP.GUI.ready', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener) => {
      subscriber.onBrowserReady();
    });

    this.addEvent('OP.GUI.tryLogin', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener, hash: string) => {
      subscriber.onTryLogin(hash);
    });

    this.addEvent('OP.GUI.tryRegister', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener, email: string, hash: string, salt: string) => {
      subscriber.onTryRegister(email, hash, salt);
    });

    this.addEvent('OP.GUI.debug', Listeners.isGuiListener,
                  (subscriber: Listeners.GuiListener, text: string) => {
      subscriber.onGuiDebug(text);
    });

    this.addEvent('OP.accountStatusUpdate', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener, isRegistered: boolean, socialClubName: string) => {
      mp.gui.chat.push('UPDATE EVENT')
      subscriber.onAccountStatusUpdate(isRegistered, socialClubName);
    });
  }

  public tick (msElapsed: number): void {
    this.subscribers.forEach((subscriber: Listener<any>) => {
      if (Listeners.isTickListener(subscriber)) {
        subscriber.onTick(msElapsed);
      }
    });

    // this.subscribers.forEach((subscriber: Listener<any>) => {
    //   if (Listeners.isTickListener(subscriber)) {
    //     subscriber.onTick(msElapsed);
    //   }
    // });

    // Workaround for buggy vehicle events
    if (Client.vehicle !== Client.lastVehicle) {
      if (Client.vehicle) {
        Client.lastVehicle = Client.vehicle;
        mp.events.call('OP.playerEnterVehicle', Client.vehicle);
      } else {
        mp.events.call('OP.playerExitVehicle', Client.lastVehicle);
      }

      Client.lastVehicle = Client.vehicle;
    }
  }
}
