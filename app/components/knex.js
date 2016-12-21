'use strict';

var knex = require('knex');
var config = require('config');

module.exports = knex(config.get('knex'));
