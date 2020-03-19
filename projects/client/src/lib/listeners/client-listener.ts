import Listener from './listener';
import Client from '@lib/client';
import Vehicle from '@lib/vehicle';

interface ClientListener extends Listener<Client> {
  onEnterVehicle(vehicle: Vehicle): void;
  onExitVehicle(lastVehicle: Vehicle): void;
}

function isClientListener(listener: Listener<any>): listener is ClientListener {
  return 'onEnterVehicle' in listener;
}

export {
  ClientListener,
  isClientListener
}
