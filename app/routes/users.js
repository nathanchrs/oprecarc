'use strict';

var express = require('express');
var auth = require('../components/auth.js');
var passport = require('../components/passport.js');
var winston = require('../components/winston.js');
var knex = require('../components/knex.js');
var validation = require('../components/validation.js');

var userSchema = require('../schemas/user.js');

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
      req.user = user;
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

router.get('/users', auth.isLoggedIn, function (req, res, next) {
  knex.select('nim', 'name', 'gender', 'email', 'phone', 'line', 'bio', 'role', 'created_at', 'updated_at')
    .from('users')
    .search(req.query.search, ['nim', 'name', 'line', 'email'])
    .pageAndSort(req.query.page, req.query.perPage, req.query.sort, ['nim', 'name', 'gender', 'email', 'phone', 'line', 'role', 'created_at', 'updated_at'])
    .then(function (users) {
      return res.render('users', { users: users });
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.get('/users/:nim([0-9]{8})', auth.isLoggedIn, function (req, res, next) {
  knex.first('nim', 'name', 'gender', 'email', 'phone', 'line', 'bio', 'role', 'created_at', 'updated_at').from('users')
    .then(function (user) {
      return res.render('user', { user: user });
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.get('/users/create', auth.isNotLoggedIn, function (req, res) {
  res.render('user-create');
});

router.post('/users', auth.isNotLoggedIn, function (req, res, next) {
  // TODO: create register form and handler
  // hash password using bcryptjs: bcrypt.hash('password', 8, function(err, hash) { });
});

router.get('/users/:nim([0-9]{8})/edit', auth.isNimOwnerOrAdmin, function (req, res, next) {
  knex.first('nim', 'name', 'gender', 'email', 'phone', 'line', 'bio', 'role', 'created_at', 'updated_at').from('users')
    .then(function (user) {
      return res.render('user-edit', { user: user });
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.put('/users/:nim([0-9]{8})', auth.isNimOwnerOrAdmin, function (req, res, next) {
  var updateSchema = (req.user.role === 'admin') ? userSchema.userUpdateAdminSchema : userSchema.userUpdateSchema;
  var input = validation.validate(req.body, updateSchema);
  if (input.error) return validation.errorRedirect(input.error, '/users/' + req.params.nim + '/edit', req, res);

  var updateData = {
    name: input.name,
    gender: input.gender,
    email: input.email,
    phone: input.phone,
    line: input.line,
    bio: input.bio,
    updated_at: new Date()
  };
  if (req.user.role === 'admin') updateData.role = input.role;

  knex('users').where('nim', req.params.nim).update(updateData)
    .then(function (user) {
      winston.log('verbose', 'User with NIM ' + req.params.nim + ' modified by ' + req.user.nim + '.');
      return res.redirect('/users/' + req.params.nim);
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.delete('/users/:nim([0-9]{8})', auth.role('admin'), function (req, res, next) {
  knex('users').where('nim', req.params.nim).del()
    .then(function (affectedRowCount) {
      if (affectedRowCount > 0) {
        winston.log('verbose', 'User with NIM ' + req.params.nim + ' deleted (' + affectedRowCount + ' affected rows) by ' + req.user.nim + '.');
        req.flash('info', 'User with NIM ' + req.params.nim + ' deleted.');
      } else {
        req.flash('info', 'No user with NIM ' + req.params.nim + ' found.');
      }
      return res.redirect('/users');
    })
    .catch(function (err) {
      return next(err);
    });
});

module.exports = router;
