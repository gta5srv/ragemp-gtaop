import Loader from '@core/loader'
import Server from '@lib/server'
import Client from '@lib/client';
import Vehicle from '@lib/vehicle';

Loader.run(__dirname)
Server.instance

require('./commands')

// TODO: REMOVE THIS SHIT
mp.events.add("OP.vehicleDeath", (vehicle: Vehicle) => {
  Client.all.call('vehicleDeath', vehicle.mp.id);

  setTimeout(() => {
    if (vehicle.isRespawnable) {
      vehicle.dead = false;
      vehicle.spawn();
      Client.all.call('vehicleSpawn', vehicle.mp.id);
    } else {
      // TODO: Fix below
      // Client.all.call('vehicleRemoved', vehicle.mp.id);
      //
      // setTimeout(() => {
      //   Vehicle.all.remove(vehicle);
      //   vehicle.mp.destroy();
      // }, 1000);
    }
  }, 15000);
});
