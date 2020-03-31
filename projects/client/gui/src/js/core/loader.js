import { GUI } from '@core/gui/gui';
import util from '@core/util';


GUI.onReady(() => {
  if (util.isDemo()) {
    document.body.classList.add('demo');

    GUI.components.forEach((component) => {
      component.setVisible(true);
    });
  }
});


window.op = {};
window.op.triggerEvent = (componentName, eventName, ...eventParams) => {
  const component = GUI.getComponentByName(componentName);

  if (component) {
    component.triggerEvent(eventName, ...eventParams);
  }
};

if (util.isDemo()) {
  window.op.gui = GUI;
}
