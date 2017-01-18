'use strict';

var auth = require('../components/auth.js');

module.exports = {

  'login': auth.isNotLoggedIn,
  'logout': auth.isLoggedIn,

  'user-list': auth.isLoggedIn,
  'user-info': auth.isLoggedIn,

  'user-create': function (req, res, next) {
    /* Only non-logged-in users or admins can create new user. */
    if (req.user && req.user.role !== 'admin') return res.redirect('/');
    next();
  },

  'user-edit': function (req, res, next) {
    /* Only admin or NIM owner can update user. */
    if (!req.user) return redirectToLogin(req, res);
    if (req.user.nim != req.params.nim && req.user.role !== 'admin') return auth.response.failed(req, res);
    next();
  },

  'user-delete': auth.role('admin')
};