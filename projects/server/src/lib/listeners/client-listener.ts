import Listener from './listener';
import Client from '@lib/client';

interface ClientListener extends Listener<Client> {
  onClientReady(): void;
  onClientDeath(reason: number, killer: Client): void;
  onClientChat(text: string): void;
  onClientCreateWaypoint(x: number, y: number): void;
}

function isClientListener(listener: Listener<any>): listener is ClientListener {
  return 'onClientReady' in listener;
}

export {
  ClientListener,
  isClientListener
};
