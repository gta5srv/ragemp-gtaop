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
    vehicle.dead = false;
    vehicle.spawn();
    Client.all.call('vehicleSpawn', vehicle.mp.id);
  }, 15000);
});
