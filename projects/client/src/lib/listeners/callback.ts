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

        // Prepend issueing subscriber to parameters
        params.unshift(subscriber);
        callback(...params);
      });
    });
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

    this.addEvent('OP.GUI.confirmLogin', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener) => {
      subscriber.onConfirmLogin();
    });

    this.addEvent('OP.GUI.confirmRegister', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener) => {
      subscriber.onConfirmRegister();
    });

    this.addEvent('OP.GUI.forgotPassword', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener) => {
      subscriber.onForgotPassword();
    });

    this.addEvent('OP.GUI.playAsGuest', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener) => {
      subscriber.onPlayAsGuest();
    });

    this.addEvent('OP.GUI.TEAMS.requestJoin', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener, teamSlug: string) => {
      subscriber.onRequestTeamJoin(teamSlug);
    });

    this.addEvent('OP.GUI.TEAMS.requestInfos', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener) => {
      subscriber.onRequestTeamInfos();
    });

    this.addEvent('OP.teamJoinResponse', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener, success: boolean, message?: string) => {
      subscriber.onTeamJoinResponse(success, message);
    });

    this.addEvent('OP.teamInfosResponse', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener, teamInfos: string) => {
      subscriber.onTeamInfosResponse(teamInfos);
    });

    this.addEvent('OP.loginResponse', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener, success: boolean, message?: string) => {
      subscriber.onLoginResponse(success, message);
    });

    this.addEvent('OP.registerResponse', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener, success: boolean, message?: string) => {
      subscriber.onRegisterResponse(success, message);
    });

    this.addEvent('OP.accountStatusUpdate', Listeners.isClientListener,
                  (subscriber: Listeners.ClientListener, socialClubName: string, isLoggedIn: boolean, registeredSalt?: string) => {
      subscriber.onAccountStatusUpdate(socialClubName, isLoggedIn, registeredSalt);
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
