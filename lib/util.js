/**
 * Dependencies
 */
const box = require('ascii-box').box;
const chalk = require('chalk');


/**
 * Prints application header
 */
function printHeader () {
  const lines = [
    '  ____                     _             ____                   ',
    ' / __ \\___  ___  ___  ___ (_)__  ___ _  / __/__  ___________ ___',
    '/ /_/ / _ \\/ _ \\/ _ \\(_-</ / _ \\/ _ `/ / _// _ \\/ __/ __/ -_|_-<',
    '\\____/ .__/ .__/\\___/___/_/_//_/\\_, / /_/  \\___/_/  \\__/\\__/___/',
    '    /_/  /_/                   /___/                            '
  ];

  console.log(
    chalk.bgBlue.white(box(
      lines.join('\n'), { border: 'dotted' }
    )),
    '\n'
  );
}


/**
 * Logs to console
 */
function log (...args) {
  console.log(chalk.bgBlue.white('[OPPOSING-FORCES]'), ...args);
}


/**
 * Module exports
 */
module.exports = {
  printHeader,
  log
};
