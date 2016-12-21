'use strict';

var winston = require('winston');
var config = require('config');

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  verbose: 'grey',
  debug: 'blue',
  silly: 'magenta'
});

// Re-apply transport to update settings
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, config.get('winston.console'));

module.exports = winston;
