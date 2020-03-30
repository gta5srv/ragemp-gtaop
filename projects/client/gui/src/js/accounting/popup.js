/**
 * Dependencies
 */
import $ from 'jquery';


/**
 * Creates pop-ups on page
 */
class PopUp {
  constructor (html) {
    this.$image = $('<div>', { class: 'popup-image' });
    this.$content = $('<div>', { class: 'popup-content' });
    this.$buttons = $('<div>', { class: 'popup-buttons '});
    this.$element = $('<div>', { class: 'popup' }).append(
      this.$image,
      this.$content,
      this.$buttons
    );
    this.$content.html(html);
    this.$element.appendTo($('body'));
  }


  set image (href) {
    this.$image.empty();

    if (href) {
      this.$image.append(
        $('<img>', { src: href })
      )
    }
  }


  set html (html) {
    this.$content.html(html);
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

    const $button = $('<button>', {
      type: 'button',
      text: text,
      class: 'button-dark'
    }).click(function (e) {
      callback();
    })

    this.$buttons.append($button);
    if (this.$buttons.children().length >= 2) {
      this.$buttons.addClass('popup-buttons-multiple')
    }
  }


  show () {
    this.$element.addClass('visible');

    const $buttons = $('button', this.$buttons);
    if ($buttons.length) {
      $buttons.first().focus();
    }
  }


  hide () {
    this.$element.removeClass('visible');
  }


  remove () {
    this.hide();

    this.$element.one("transitionend webkitTransitionEnd oTransitionEnd", () => {
      this.$element.remove();
    });
  }
}


module.exports = {
  PopUp
}
