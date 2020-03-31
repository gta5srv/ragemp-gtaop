import DOM from '@lib/dom';


/**
 * Creates pop-ups on page
 */
class PopUp {
  nodes = {};


  constructor (html) {
    this._createNodes();
    this.html = html;
    document.body.append(this.nodes.wrapper);
  }


  _createNodes () {
    const image = document.createElement('div');
    image.classList.add('popup-image');

    const content = document.createElement('div');
    content.classList.add('popup-content');

    const buttons = document.createElement('div');
    buttons.classList.add('popup-buttons');

    const main = document.createElement('div');
    main.classList.add('popup');
    main.append(image, content, buttons);

    const wrapper = document.createElement('div');
    wrapper.classList.add('popup-wrapper');
    wrapper.append(main);

    this.nodes.image = image;
    this.nodes.content = content;
    this.nodes.buttons = buttons;
    this.nodes.main = main;
    this.nodes.wrapper = wrapper;
  }


  set image (href) {
    this.nodes.image.innerHTML = '';

    if (href) {
      const image = document.createElement('img');
      image.setAttribute('src', href);
      this.nodes.image.append(image);
    }
  }


  set html (html) {
    this.nodes.content.innerHTML = html;
  }


  success () {
    this.image = 'assets/img/tick.svg';
  }


  error () {
    this.image = 'assets/img/alert.svg';
  }


  button (text, callback) {
    if (typeof callback !== 'function') {
      callback = () => this.remove();
    }

    const button = document.createElement('button');
    button.classList.add('button-dark');
    button.innerHTML = text;
    button.setAttribute('type', 'button');
    button.addEventListener('click', function () {
      callback();
    });

    this.nodes.buttons.append(button);
    if (this.nodes.buttons.childElementCount.length >= 2) {
      this.nodes.buttons.classList.add('popup-buttons-multiple');
    }
  }


  show () {
    this.nodes.wrapper.classList.add('visible');
    setImmediate(() => this.nodes.main.classList.add('visible'));

    const button = this.nodes.buttons.querySelector('button');
    if (button) {
      button.focus();
    }
  }


  hide () {
    this.nodes.wrapper.classList.remove('visible');
  }


  remove () {
    this.nodes.wrapper.addEventListener('transitionend', () => {
      DOM.remove(this.nodes.wrapper);
    });

    this.hide();
  }
}


module.exports = {
  PopUp
}
