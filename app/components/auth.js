'use strict';

var _ = require('lodash');
var winston = require('./winston.js');
var auth = {};

/* Helper functions */

auth.response = {};

auth.response.redirectToLogin = function (req, res) {
  req.flash('error', 'Login terlebih dahulu untuk lanjut.');
  req.session.redirectTo = req.originalUrl;
  winston.debug('Login required, redirectTo: ' + req.session.redirectTo);
  return res.redirect('/login');
};

auth.response.failed = function (req, res) {
  winston.log('verbose', 'Unauthorized access to ' + req.originalUrl + ' by ' + req.user.name + ' (' + req.user.nim + ') blocked.');
  return res.sendStatus(403);
};

/* Middleware for use in ACL */

auth.isLoggedIn = function (req, res, next) {
  if (!req.user) return this.response.redirectToLogin(req, res);
  next();
};

auth.isNotLoggedIn = function (req, res, next) {
  if (req.user) return res.redirect('/');
  next();
};

auth.role = function (roles) {
  if (typeof roles === 'string') roles = [roles];
  return function (req, res, next) {
    if (!req.user) return this.response.redirectToLogin(req, res);
    if (!_.includes(roles, req.user.role)) return this.response.failed(req, res);
    next();
  };
};

module.exports = auth;
