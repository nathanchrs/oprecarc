'use strict';

var express = require('express');
// var knex = require('../components/knex.js');

var router = express.Router();
router.baseRoute = '/';

router.get('/', function (req, res) {
  res.render('home');
});

module.exports = router;
