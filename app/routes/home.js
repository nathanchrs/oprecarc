'use strict';

var express = require('express');
var knex = require('../components/knex.js');

var router = express.Router();
router.baseRoute = '/';

router.get('/', function (req, res) {
  res.send('<h1>Hello world!</h1>');
});

module.exports = router;

// hash using bcryptjs: bcrypt.hash('bacon', 8, function(err, hash) { });
