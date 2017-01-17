'use strict';

var express = require('express');
var auth = require('../components/auth.js');
var passport = require('../components/passport.js');
var winston = require('../components/winston.js');
var knex = require('../components/knex.js');
var validation = require('../components/validation.js');
var bcrypt = require('bcryptjs');

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
  knex.first('nim', 'name', 'gender', 'email', 'phone', 'line', 'bio', 'role', 'created_at', 'updated_at')
    .where('nim', req.params.nim)
    .from('users')
    .then(function (user) {
      if (!user) return res.sendStatus(404);
      return res.render('user', { user: user });
    })
    .catch(function (err) {
      return next(err);
    }); 
});

// Note: add auth.isLoggedIn middleware here to prevent non-registerd users form registering
router.get('/users/create', function (req, res) {
  if (req.user && req.user.role !== 'admin') return res.redirect('/'); // If not logged in yet, still can create user
  res.render('user-edit');
});

// Note: add auth.isLoggedIn middleware here to prevent non-registerd users form registering
router.post('/users', function (req, res, next) {
  if (req.user && req.user.role !== 'admin') return res.redirect('/'); // If not logged in yet, still can create user

  var insertSchema = (req.user && req.user.role === 'admin') ? userSchema.userInsertAdminSchema : userSchema.userInsertSchema;
  var input = validation.validate(req.body, insertSchema);
  if (input.error) return validation.errorRedirect(input.error, '/users/create', req, res);

  knex.select('nim').from('users').where('nim', input.value.nim).first()
    .then(function (nim) {
      if (nim) return validation.errorRedirect({ details: [{ message: 'NIM already exists.', path: 'nim' }], _object: req.body }, '/users/create', req, res);

      bcrypt.hash(input.value.password, 8) // 8 is the salt length to generate
        .then(function (hash) {
          var insertData = {
            nim: input.value.nim,
            name: input.value.name,
            gender: input.value.gender,
            email: input.value.email,
            phone: input.value.phone,
            line: input.value.line,
            password: hash,
            bio: input.value.bio,
            created_at: new Date(),
            updated_at: new Date()
          };
          insertData.role = (req.user && req.user.role === 'admin') ? input.value.role : 'cakru';

          return knex('users').insert(insertData);
        })
        .then(function () {
          if (req.user) {
            winston.log('verbose', 'User with NIM ' + input.value.nim + ' created by ' + req.user.nim + '.');
            return res.redirect('/users/' + input.value.nim);
          } else {
            winston.log('verbose', 'User with NIM ' + input.value.nim + ' registered.');
            req.flash('info', 'Registration successful, you can now log in.');
            return res.redirect('/login');
          }
        })
        .catch(function (err) {
          return next(err);
        }); 
    })
    .catch(function (err) {
      return next(err);
    });
});

router.get('/users/:nim([0-9]{8})/edit', auth.isNimOwnerOrAdmin, function (req, res, next) {
  knex.first('nim', 'name', 'gender', 'email', 'phone', 'line', 'bio', 'role', 'created_at', 'updated_at')
  .where('nim', req.params.nim).from('users')
    .then(function (user) {
      if (!user) return res.sendStatus(404);
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
    name: input.value.name,
    gender: input.value.gender,
    email: input.value.email,
    phone: input.value.phone,
    line: input.value.line,
    bio: input.value.bio,
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
  if (req.user.nim == req.params.nim) return res.sendStatus(403);
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
