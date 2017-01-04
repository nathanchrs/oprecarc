'use strict';

var express = require('express');
var auth = require('../components/auth.js');
var passport = require('../components/passport.js');
var winston = require('../components/winston.js');
var knex = require('../components/knex.js');

var router = express.Router();
router.baseRoute = '/';

router.get('/login', auth.isNotLoggedIn, function (req, res) {
  res.render('login');
});

router.post('/login', auth.isNotLoggedIn, function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) return next(err);
    if (!user) {
      winston.log('verbose', 'Unsuccessful login attempt, NIM ' + req.body.nim + '.');
      if (info) req.flash('error', info.message);
      req.flash('oldInput', req.body);
      return res.redirect('/login');
    }
    req.login(user, function (err) {
      if (err) return next(err);
      winston.log('verbose', 'User ' + user.name + ' (' + user.nim + ') logged in.');
      req.flash('info', 'Selamat datang, ' + user.name, '!');
      var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';
      delete req.session.redirectTo;
      return res.redirect(redirectTo);
    });
  })(req, res, next);
});

router.post('/logout', auth.isLoggedIn, function (req, res) {
  var loggedOutUser = req.user;
  req.logout();
  winston.log('verbose', 'User ' + loggedOutUser.name + ' (' + loggedOutUser.nim + ') logged out.');
  req.flash('info', 'Logout berhasil.');
  res.redirect('/login');
});

router.get('/register', auth.isNotLoggedIn, function (req, res) {
  res.render('register');
});

router.post('/register', auth.isNotLoggedIn, function (req, res) {
  res.render('register');
  // TODO: create register form and handler
  // hash password using bcryptjs: bcrypt.hash('password', 8, function(err, hash) { });
});

router.get('/users', auth.isLoggedIn, function (req, res, next) {
  knex.select('nim', 'name', 'gender', 'email', 'phone', 'line', 'bio', 'role', 'created_at', 'updated_at')
    .from('users')
    .filter(req.query, { nim: {}, name: {}, gender: {}, email: {}, phone: {}, line: {}, role: {} })
    .pageAndSort(req.query.page, req.query.perPage, req.query.sort, ['nim', 'name', 'gender', 'email', 'phone', 'line', 'role', 'created_at', 'updated_at'])
    .then(function (users) {
      return res.json(users);
      //return res.render('users', { users: users });
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.get('/users/:nim([0-9]{8})', auth.isLoggedIn, function (req, res, next) {
  knex.first('nim', 'name', 'gender', 'email', 'phone', 'line', 'bio', 'role', 'created_at', 'updated_at').from('users')
    .then(function (user) {
      return res.render('profile', { user: user });
    })
    .catch(function (err) {
      return next(err);
    }); 
});

module.exports = router;
