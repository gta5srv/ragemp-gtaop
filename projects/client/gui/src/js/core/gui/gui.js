import util from '@core/util';
import DOM from '@lib/dom';
import { GUIComponent } from './gui-component';


class GUI {
  static _instance = null;
  static _components = [];
  static _readyCallbacks = [];
  static DOMReadyRegistered = false;


  constructor () {
    const componentNodes = document.querySelectorAll('[data-gui-component]');
    GUI._components = Array.from(componentNodes).map((componentElement) => {
      const componentName = componentElement.getAttribute('data-gui-component');
      return new GUIComponent(componentName, componentElement);
    });

    GUI.components.forEach((guiComponent) => {
      GUI.callClient('componentReady', guiComponent.name)
    });
  }


  static get instance () {
    if (!GUI._instance) {
      GUI._instance = new GUI();
    }

    return GUI._instance;
  }


  static get components () {
    return GUI._components;
  }


  static getComponentByName (name) {
    const components = GUI.components.filter((component) => {
      return component.name === name;
    });

    return components.length ? components[0] : null;
  }


  static onReady (callback) {
    if (DOM.isReady()) {
      callback.call(this);
      return;
    }

    GUI._readyCallbacks.push(callback);
  }


  static DOMReady () {
    GUI.instance;

    GUI._readyCallbacks.forEach((callback) => {
      callback.call(this);
    });
  }


  static callClient (eventName, ...eventParams) {
    eventName = 'OP.GUI.' + eventName;

    if (util.isDemo()) {
      eventParams.unshift(eventName);

      const paramsString = eventParams.map((e) => {
        return typeof e === 'string' ? `'${e}'` : String(e);
      }).join(', ');

      console.log(`mp.trigger(${paramsString})`);
      return;
    }

    mp.trigger(eventName, ...eventParams);
  }


  static replacePlaceholder (id, replace) {
    const placeholderNodes = document.querySelectorAll(`[data-placeholder="${id}"]`);

    placeholderNodes.forEach((placeholderNode) => {
      if (placeholderNode.matches('input')) {
        placeholderNode.value = replace;
      } else {
        placeholderNode.innerHTML = replace;
      }
    });
  }
}


if (!GUI.DOMReadyRegistered) {
  GUI.DOMReadyRegistered = true;
  DOM.onReady(GUI.DOMReady);
}


module.exports = {
  GUI
};
