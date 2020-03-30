import Listener from './listener';
import Gui from '@lib/gui';

interface GuiListener extends Listener<Gui> {
  onGuiDebug(text: string): void;
}

function isGuiListener(listener: Listener<any>): listener is GuiListener {
  return 'onGuiDebug' in listener;
}

export {
  GuiListener,
  isGuiListener
}
