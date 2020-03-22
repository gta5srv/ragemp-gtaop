/**
 * Dependencies
 */
import $ from 'jquery';
import { PopUp } from './popup';


/**
 * Variables
 */
let $forms = $();


/**
 * On document ready
 */
$(function () {
  // Is on accounting page
  const $accounting = $('body.accounting');
  if (!$accounting.length) {
    return;
  }

  $forms = $('form', $accounting);

  $('#username', $forms).val('Natural BOT Killer');
  $('#register-username', $forms).val('Natural BOT Killer');
});


/**
 * Show login form (global)
 */
window.showLoginForm = () => {
  $forms
    .removeClass('active')
    .filter('.form-login')
    .addClass('active');
}


/**
 * Show register form (global)
 */
window.showRegisterForm = () => {
  $forms
    .removeClass('active')
    .filter('.form-register')
    .addClass('active');
}
