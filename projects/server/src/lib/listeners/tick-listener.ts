import Listener from './listener';

class Tick {
}

interface TickListener extends Listener<Tick> {
  onTick(msElapsed: number): void;
}

function isTickListener(listener: Listener<any>): listener is TickListener {
  return 'onTick' in listener;
}

export {
  TickListener,
  isTickListener
};
