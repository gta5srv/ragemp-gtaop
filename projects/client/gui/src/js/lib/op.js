import $ from 'jquery';

function getCfg () {
  return window.OPPOSING_FORCES ? window.OPPOSING_FORCES : {};
}

function debug (...args) {
  mp.trigger('OP.GUI.debug', ...args.map(a => String(a)).join(' '));
}

function replacePlaceholder (id, replace) {
  const $placeholder = $(`[data-placeholder="${id}"]`);

  if ($placeholder.is('input')) {
    $placeholder.val(replace);
  } else {
    $placeholder.html(replace);
  }
}

module.exports = {
  getCfg,
  debug,
  replacePlaceholder
};
