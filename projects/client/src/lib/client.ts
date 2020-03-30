import Vehicle from "@lib/vehicle";
import * as Listeners from '@lib/listeners';
import Gui from "@lib/gui";

export default class Client implements Listeners.ClientListener {
  private static _instance: Client;
  public readonly listeners: Listeners.Callback;
  public static isLoggedIn: boolean = false;

  public static readonly mp: PlayerMp = mp.players.local;
  public static readonly gui: Gui = new Gui();
  public static lastVehicle: Vehicle|null = null;

  private isGuiReady: boolean = false;
  private awaitingLogin: boolean = false;
  private awaitingRegister: boolean = false;

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

  public onTryLogin(hash: string): void {
    if (this.awaitingLogin) {
      return;
    }

    this.awaitingLogin = true;
    mp.events.callRemote('OP.CLIENT.tryLogin', hash);
  }

  public onLoginResponse (success: boolean, message?: string): void {
    this.awaitingLogin = false;
    Client.gui.loginResult(success, message);
  }

  public onConfirmLogin (): void {
    mp.events.callRemote('OP.CLIENT.requestAccountStatus');
  }

  public onTryRegister (email: string, hash: string, salt: string): void {
    if (this.awaitingRegister) {
      return;
    }

    this.awaitingRegister = true;
    mp.events.callRemote('OP.CLIENT.tryRegister', email, hash, salt);
  }

  public onRegisterResponse (success: boolean, message?: string): void {
    this.awaitingRegister = false;
    Client.gui.registerResult(success, message);
  }

  public onConfirmRegister (): void {
    mp.events.callRemote('OP.CLIENT.requestAccountStatus');
  }

  public onBrowserReady(): void {
    if (!this.isGuiReady) {
      this.isGuiReady = true;

      mp.events.callRemote('OP.CLIENT.ready');
      mp.events.callRemote('OP.CLIENT.requestAccountStatus');
    }
  }

  public onForgotPassword (): void {
    mp.events.callRemote('OP.CLIENT.forgotPassword');
  }

  public onPlayAsGuest (): void {
    Client.gui.toggleLoginRegister(false);
  }

  public onAccountStatusUpdate(socialClubName: string, isLoggedIn: boolean, registeredSalt?: string): void {
    if (!isLoggedIn) {
      if (registeredSalt != null) {
        Client.gui.showLogin(socialClubName, registeredSalt);
      } else {
        Client.gui.showRegister(socialClubName);
      }
    }

    Client.gui.toggleLoginRegister(!isLoggedIn);
  }
}
