import $ from 'jquery';
import op from './lib/op';

$(function () {
  if (op.getCfg().isProduction === false) {
    $('body').addClass('demo');
  }

  mp.trigger('OP.GUI.ready');
});
