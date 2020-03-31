class GUIComponent {
  _name = null;
  _node = null;
  _events = {};


  constructor (name, node) {
    this._name = name;
    this._node = node;
  }


  get name () {
    return this._name;
  }

  get node () {
    return this._node;
  }


  setVisible (toggle) {
    if (toggle) {
      this._node.classList.add('visible');
    } else {
      this._node.classList.remove('visible');
    }
  }


  triggerEvent (eventName, ...eventParams) {
    const eventCallbacks = this._events[eventName];
    if (!Array.isArray(eventCallbacks)) {
      return;
    }

    eventCallbacks.forEach((eventCallback) => {
      console.log('single cb', typeof eventCallback)
      eventCallback.apply(this, eventParams)
    });
  }


  registerEvent (eventName, eventCallback) {
    if (!Array.isArray(this._events[eventName])) {
      this._events[eventName] = [];
    }

    this._events[eventName].push(eventCallback);
  }
}


module.exports = {
  GUIComponent
};
