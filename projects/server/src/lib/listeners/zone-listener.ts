import Listener from './listener';
import Zone from '@lib/zone';
import Client from '@lib/client';

interface ZoneListener extends Listener<Zone> {
  onZoneEnter(client: Client): void;
  onZoneExit(client: Client): void;
}

function isZoneListener(listener: Listener<any>): listener is ZoneListener {
  return 'onZoneEnter' in listener;
}

export {
  ZoneListener,
  isZoneListener
};
