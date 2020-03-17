import Types from "@core/types";
import Client from "@lib/client";

export default class Spawnable {
  protected _spawns: Types.Location[] = []

  get spawns (): Types.Location[] {
    return this._spawns;
  }

  set spawns (spawns)  {
    this._spawns = spawns
  }

  get randomSpawn (): Types.Location {
    return this._spawns[Math.floor(Math.random() * this._spawns.length)];
  }

  public spawn (client: Client, spawnId?: number): void {
    const spawn = spawnId ? this._spawns[spawnId] : this.randomSpawn

    client.mp.spawn(spawn.position);
    client.heading = spawn.rotation.z;
  }
}
