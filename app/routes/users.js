'use strict';

var express = require('express');
var acl = require('../components/acl.js');
var passport = require('../components/passport.js');
var winston = require('../components/winston.js');
var knex = require('../components/knex.js');
var validation = require('../components/validation.js');
var bcrypt = require('bcryptjs');

var router = express.Router();
router.baseRoute = '/';

router.get('/login', acl.check('login'), function (req, res) {
  res.render('login');
});

router.post('/login', acl.check('login'), function (req, res, next) {
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

router.post('/logout', acl.check('logout'), function (req, res) {
  var loggedOutUser = req.user;
  req.logout();
  winston.log('verbose', 'User ' + loggedOutUser.name + ' (' + loggedOutUser.nim + ') logged out.');
  req.flash('info', 'Logout berhasil.');
  res.redirect('/login');
});

router.get('/users', acl.check('user-list'), function (req, res, next) {
  knex.select('nim', 'name', 'gender', 'email', 'phone', 'line', 'bio', 'role', 'created_at', 'updated_at')
    .from('users')
    .search(req.query.search, ['nim', 'name', 'line', 'email'])
    .pageAndSort(req.query.page, req.query.perPage, req.query.sort,
      ['nim', 'name', 'gender', 'email', 'phone', 'line', 'role', 'created_at', 'updated_at'])
    .then(function (users) {
      return res.render('users', { users: users });
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.get('/users/:nim([0-9]{8})', acl.check('user-info'), function (req, res, next) {
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

router.get('/users/create', acl.check('user-create'), function (req, res) {
  res.render('user-edit'); // Reused user-edit template for create.
});

router.post('/users', acl.check('user-create'),
  validation.validateBody('user-create', '/users/create'), function (req, res, next) {

  knex.select('nim').from('users').where('nim', req.input.nim).first()
    .then(function (nim) {
      if (nim) return validation.errorRedirect({
          details: [{ message: 'NIM already exists.', path: 'nim' }],
          _object: req.body
        }, '/users/create', req, res);

      bcrypt.hash(req.input.password, 8) // 8 is the salt length to generate
        .then(function (hash) {
          var insertData = {
            nim: req.input.nim,
            name: req.input.name,
            gender: req.input.gender,
            email: req.input.email,
            phone: req.input.phone,
            line: req.input.line,
            password: hash,
            bio: req.input.bio,
            created_at: new Date(),
            updated_at: new Date()
          };
          insertData.role = (req.user && req.user.role === 'admin') ? req.input.role : 'cakru';

          return knex('users').insert(insertData);
        })
        .then(function () {
          if (req.user) {
            winston.log('verbose', 'User with NIM ' + req.input.nim + ' created by ' + req.user.nim + '.');
            return res.redirect('/users/' + req.input.nim);
          } else {
            winston.log('verbose', 'User with NIM ' + req.input.nim + ' registered.');
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

router.get('/users/:nim([0-9]{8})/edit', acl.check('user-edit'), function (req, res, next) {
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


router.put('/users/:nim([0-9]{8})', acl.check('user-edit'),
  validation.validateBody('user-edit', function (req) { return '/users/' + req.params.nim + '/edit'; }),
  function (req, res, next) {

  var updateData = {
    name: req.input.name,
    gender: req.input.gender,
    email: req.input.email,
    phone: req.input.phone,
    line: req.input.line,
    bio: req.input.bio,
    updated_at: new Date()
  };
  if (req.user.role === 'admin') updateData.role = req.input.role;

  knex('users').where('nim', req.params.nim).update(updateData)
    .then(function (user) {
      winston.log('verbose', 'User with NIM ' + req.params.nim + ' modified by ' + req.user.nim + '.');
      return res.redirect('/users/' + req.params.nim);
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.delete('/users/:nim([0-9]{8})', acl.check('user-delete'), function (req, res, next) {
  if (req.user.nim == req.params.nim) return res.sendStatus(403); // Prevent current user from being deleted
  knex('users').where('nim', req.params.nim).del()
    .then(function (affectedRowCount) {
      if (affectedRowCount > 0) {
        winston.log('verbose', 'User with NIM ' + req.params.nim
          + ' deleted (' + affectedRowCount + ' affected rows) by ' + req.user.nim + '.');
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
