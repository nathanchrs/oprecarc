'use strict';

var _ = require('lodash');
var winston = require('./winston.js');
var auth = {};

auth.isLoggedIn = function (req, res, next) {
  if (!req.user) {
    req.flash('error', 'Login terlebih dahulu untuk lanjut.');
    req.session.redirectTo = req.originalUrl;
    winston.debug('Login required (isLoggedIn), redirectTo: ' + req.session.redirectTo);
    return res.redirect('/login');
  }
  next();
};

auth.isNotLoggedIn = function (req, res, next) {
  if (req.user) return res.redirect('/');
  next();
};

auth.role = function (roles) {
  if (typeof roles === 'string') roles = [roles];
  return function (req, res, next) {
    if (!req.user) {
      req.flash('error', 'Login terlebih dahulu untuk lanjut.');
      req.session.redirectTo = req.originalUrl;
      return res.redirect('/login');
    }
    if (!_.contains(roles, req.user.role)) {
      winston.log('verbose', 'Unauthorized access to ' + req.originalUrl + ' by ' + req.user.name + ' (' + req.user.nim + ') blocked.');
      return res.sendStatus(401);
    }
    next();
  };
};

module.exports = auth;
