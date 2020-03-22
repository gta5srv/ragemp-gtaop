/**
 * Dependencies
 */
import $ from 'jquery';


/**
 * Validate email
 * @param  {string} email Email string to validate
 * @return {boolean}      Indicates correct format
 */
function validateEmail (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


/**
 * Insert info text
 *
 * @param  {jQuery} $label Label jQuery instance
 * @param  {string} html   HTML to show
 * @return {void}
 */
function insertInfo ($label, html) {
  const $info = $('<div>', { class: 'label-info' });
  $info.appendTo($label);
  $info.empty();
  $info.html(html);
  $info.addClass('visible')
}


/**
 * Validate form
 *
 * @param  {jQuery} $form Form jQuery instance
 * @return {boolean}      Indicates success or failure
 */
function validate ($form) {
  const $inputs = $('input', $form);

  let totalCount = $inputs.length;
  let validCount = 0;

  // Iterate through all found inputs
  $inputs.each(function () {
    const $label = $(this).parent('label');
    // No parent label was found -> stop here
    if (!$label.length) {
      return;
    }

    const value = $(this).val();

    // Remove all existing label info texts
    $('.label-info', $label).remove();

    // Is required
    if ($(this).prop('required')) {
      const minLength = parseInt($(this).attr('minlength'));

      // Has minimum length attribute
      if (minLength && value.length < minLength) {
        insertInfo($label, `This field requires at least ${minLength} characters.`);
        return;
      }

      // Is empty
      if (!value.length) {
        insertInfo($label, "This field can't be empty.");
        return;
      }
    }

    // Is an invalid E-Mail
    if ($(this).attr('type') === 'email' && !validateEmail(value)) {
      if (value.length) {
        insertInfo($label, "The provided format is invalid.");
        return;
      }
    }

    validCount++;
  });

  return totalCount === validCount;
}


/**
 * On form submit
 */
$(document).on('submit', 'form', function (e) {
  e.preventDefault();

  const isValid = validate($(this));
  if (isValid) {
    alert('VALID');
  }
});
