import Vehicle from "@lib/vehicle";
import * as Listeners from '@lib/listeners';
// import bcrypt from 'bcryptjs';
import Gui from "@lib/gui";

export default class Client implements Listeners.ClientListener {
  private static _instance: Client;
  public readonly listeners: Listeners.Callback;
  public static isLoggedIn: boolean = false;

  public static readonly mp: PlayerMp = mp.players.local;
  public static readonly gui: Gui = new Gui();
  public static lastVehicle: Vehicle|null = null;
  private isGuiReady: boolean = false;

  constructor () {
    this.listeners = new Listeners.Callback();
    this.listeners.add(this);
  }

  public static get instance () {
    if (!Client._instance) {
      Client._instance = new Client();
    }

    return Client._instance;
  }

  static get vehicle () {
    return Vehicle.all.byVehicleMp(mp.players.local.vehicle);
  }

  public static message (...args: any[]) {
    mp.gui.chat.push(args.map((a) => String(a)).join(' '));
  }

  public onEnterVehicle (vehicle: Vehicle): void {
    vehicle.hiddenOnMap = true;
  }

  public onExitVehicle (lastVehicle: Vehicle): void {
    lastVehicle.hiddenOnMap = false;
  }

  onTryLogin(hash: string): boolean {
    throw new Error("Method not implemented.");
  }

  onTryRegister(email: string, hash: string, salt: string): void {
    mp.gui.chat.push('TRY REGISTER ' + email);
    mp.gui.chat.push('HASH: ' + hash);
    mp.gui.chat.push('SALT: ' + salt);
  }

  onBrowserReady(): void {
    mp.gui.chat.push('BROWSER READY')

    if (!this.isGuiReady) {
      this.isGuiReady = true;

      mp.events.callRemote('OP.CLIENT.ready');
    }
  }

  onAccountStatusUpdate(isRegistered: boolean, socialClubName: string): void {
    mp.gui.chat.push('Is registered? ' + Boolean(isRegistered));

    if (isRegistered) {
      Client.gui.showLogin(socialClubName);
    } else {
      Client.gui.showRegister(socialClubName);
    }
  }
}
