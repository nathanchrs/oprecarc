'use strict';

var express = require('express');
var auth = require('../components/auth.js');
// var knex = require('../components/knex.js');

var router = express.Router();
router.baseRoute = '/';

router.get('/', auth.isLoggedIn, function (req, res) {
  res.render('home');
});

module.exports = router;
