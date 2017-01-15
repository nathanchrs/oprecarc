'use strict';

var _ = require('lodash');
var winston = require('./winston.js');
var auth = {};

function redirectToLogin(req, res) {
  req.flash('error', 'Login terlebih dahulu untuk lanjut.');
  req.session.redirectTo = req.originalUrl;
  winston.debug('Login required, redirectTo: ' + req.session.redirectTo);
  return res.redirect('/login');
}

function authFailedResponse(req, res) {
  winston.log('verbose', 'Unauthorized access to ' + req.originalUrl + ' by ' + req.user.name + ' (' + req.user.nim + ') blocked.');
  return res.sendStatus(403);
}

auth.isLoggedIn = function (req, res, next) {
  if (!req.user) return redirectToLogin(req, res);
  next();
};

auth.isNotLoggedIn = function (req, res, next) {
  if (req.user) return res.redirect('/');
  next();
};

auth.role = function (roles) {
  if (typeof roles === 'string') roles = [roles];
  return function (req, res, next) {
    if (!req.user) return redirectToLogin(req, res);
    if (!_.includes(roles, req.user.role)) return authFailedResponse(req, res);
    next();
  };
};

auth.isNimOwnerOrAdmin = function (req, res, next) {
  if (!req.user) return redirectToLogin(req, res);
  if (req.user.nim != req.params.nim && req.user.role !== 'admin') return authFailedResponse(req, res);
  next();
};

module.exports = auth;
