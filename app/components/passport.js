'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local');
var knex = require('./knex.js');
var bcrypt = require('bcryptjs');

passport.use(new LocalStrategy ({
    usernameField: 'nim',
    passwordField: 'password'
  },
  function (nim, password, done) {
    knex.first('nim', 'name', 'role', 'email', 'password').from('users').where('nim', nim)
      .then(function (user) {
        if (!user) {
          return done(null, false, { message: 'Wrong NIM or password.' });
        }
        bcrypt.compare(password, user.password, function (err, res) {
          if (err) return done(err);
          if (!res) return done(null, false, { message: 'Wrong NIM or password.' });
          return done(null, user);
        });
      })
      .catch(function (err) {
        return done(err);
      });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.nim);
});

passport.deserializeUser(function(nim, done) {
  knex.first('nim', 'name', 'role', 'email').from('users').where('nim', nim)
    .then(function (user) {
      done(null, user);
    })
    .catch(function (err) {
      done(err);
    });
});

module.exports = passport;
