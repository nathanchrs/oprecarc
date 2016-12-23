'use strict';

var express = require('express');
var passport = require('../components/passport.js');
// var knex = require('../components/knex.js');

var router = express.Router();
router.baseRoute = '/';

router.get('/login', function (req, res) {
  res.render('login');
});

router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) return next(err);
    if (!user) {
      if (info) req.flash('error', info.message);
      req.flash('oldInput', req.body);
      return res.redirect('/login');
    }
    req.login(user, function (err) {
      if (err) return next(err);
      req.flash('info', 'Selamat datang, ' + user.name, '!');
      return res.redirect('/');
    });
  })(req, res, next);
});

router.post('/logout', function (req, res) {
  req.logout();
  req.flash('info', 'Logout berhasil.');
  res.redirect('/');
});

router.get('/register', function (req, res) {
  res.render('register');
});

router.post('/register', function (req, res) {
  res.render('register');
  // TODO: create register form and handler
  // hash password using bcryptjs: bcrypt.hash('password', 8, function(err, hash) { });
});

module.exports = router;
