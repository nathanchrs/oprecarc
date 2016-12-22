'use strict';

var session = require('express-session');
var knex = require('./knex.js');
var config = require('config');

var KnexSessionStore = require('connect-session-knex')(session);
var sessionStore = new KnexSessionStore({
  knex: knex,
  tablename: 'sessions'
});

module.exports = session({
  resave: false,
  saveUninitialized: false,
  secret: config.get('secret'),
  store: sessionStore
});
