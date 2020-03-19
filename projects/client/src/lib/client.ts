import Vehicle from "@lib/vehicle";
import * as Listeners from '@lib/listeners';

export default class Client implements Listeners.ClientListener {
  private static _instance: Client;
  public readonly listeners: Listeners.Callback;

  public static readonly mp: PlayerMp = mp.players.local;
  public static lastVehicle: Vehicle|null = null;

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
}
