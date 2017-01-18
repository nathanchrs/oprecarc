'use strict';

var auth = require('../components/auth.js');

module.exports = {

  'home': auth.isLoggedIn
  
};