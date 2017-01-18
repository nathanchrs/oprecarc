'use strict';

var express = require('express');
var acl = require('../components/acl.js');
// var knex = require('../components/knex.js');

var router = express.Router();
router.baseRoute = '/';

router.get('/', acl.check('home'), function (req, res) {
  res.render('home');
});

module.exports = router;
