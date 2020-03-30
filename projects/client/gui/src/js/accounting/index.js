/**
 * Dependencies
 */
import './forms';
import { PopUp } from './popup';
import op from '../op';

import $ from 'jquery';
import bcrypt from 'bcryptjs';


/**
 * Variables
 */
let $main = $();
let $forms = $();
let registeredSalt = null;


/**
 * On document ready
 */
function getFormData ($form) {
  let formData = {}

  const formInfos = $form.serializeArray();
  formInfos.forEach((formInfo) => {
    formData[formInfo.name] = formInfo.value;
  });

  return formData;
}


$(function () {
  mp.trigger('OP.GUI.ready', 'accounting');

  $main = $('.accounting-container');

  $forms = $('form', $main);
  $forms.submit(function (e) {
    if (e.isDefaultPrevented()) {
      return;
    }

    e.preventDefault();
    let formData = getFormData($(this));

    if ($(this).hasClass('form-login')) {
      if (registeredSalt === null) {
        throw Error('No registered salt given');
      }

      const hash = bcrypt.hashSync(formData.password, registeredSalt);
      mp.trigger('OP.GUI.tryLogin', hash);
      return;
    }

    if ($(this).hasClass('form-register')) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(formData.password, salt);

      mp.trigger('OP.GUI.tryRegister', formData.email, hash, salt);
      return;
    }
  });
});


/**
 * Show login form (global)
 */
window.showLoginForm = (socialClubName, savedRegisteredSalt) => {
  $forms
    .removeClass('active')
    .filter('.form-login')
    .addClass('active')
    .find('input:not([disabled]):first')
    .focus();

  registeredSalt = savedRegisteredSalt;
  op.replacePlaceholder('socialclub', socialClubName);
};


/**
 * Show register form (global)
 */
window.showRegisterForm = (socialClubName) => {
  $forms
    .removeClass('active')
    .filter('.form-register')
    .addClass('active')
    .find('input:not([disabled]):first')
    .focus();

  op.replacePlaceholder('socialclub', socialClubName);
};


window.onLoginResult = (success, message) => {
  const loginAlert = new PopUp();

  if (success) {
    loginAlert.html = 'Login has been successfull.';
    loginAlert.success();
    loginAlert.button('Okay', () => {
      mp.trigger('OP.GUI.confirmLogin');
      loginAlert.remove();
    });
  } else {
    let html = 'Login has failed.';
    if (message) {
      html += `<br><br><strong>${message}</strong>`
    }

    loginAlert.html = html;
    loginAlert.error();
    loginAlert.button('Retry', () => {
      $('.form-login [name="password"]').focus();
      loginAlert.remove();
    });
  }

  loginAlert.show();
};


window.onRegisterResult = (success, message) => {
  const registerAlert = new PopUp();

  if (success) {
    registerAlert.html = 'Registration has been successfull.';
    registerAlert.success();
    registerAlert.button('Okay', () => {
      mp.trigger('OP.GUI.confirmRegister');
      registerAlert.remove();
    });
  } else {
    let html = 'Registration has failed.';
    if (message) {
      html += `<br><br><strong>${message}</strong>`
    }

    registerAlert.html = html;
    registerAlert.error();
    registerAlert.button('Okay');
  }
  registerAlert.show();
};


window.onPlayAsGuest = () => {
  const playAsGuest = new PopUp(
    'Your account has not been registered yet.<br><br>'
    + 'To <strong>save your progress</strong> and '
    + '<strong>secure it</strong> you need to claim '
    + 'it as yours.<br><br>'
    + 'Proceed anyway?');

  playAsGuest.error();
  playAsGuest.button('Go back');
  playAsGuest.button('Proceed', () => {
    mp.trigger('OP.GUI.playAsGuest');
    playAsGuest.remove();
  });
  playAsGuest.show();
};


window.onForgotPassword = () => {
  const forgotPassword = new PopUp('We will send an E-Mail to your account containing instructions on how to reset your password.');
  forgotPassword.error();
  forgotPassword.button('Okay', () => {
    mp.trigger('OP.GUI.forgotPassword');
    forgotPassword.remove();

    const confirm = new PopUp('An E-Mail containing reset instructions has been sent.<br><br>Please check your inbox.');
    confirm.success();
    forgotPassword.button('Okay');
  });
  forgotPassword.button('Go back');
  forgotPassword.show();
};


window.toggleAll = function (toggle) {
  $main.toggleClass('visible', toggle);
};
