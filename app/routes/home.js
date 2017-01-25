'use strict';

var express = require('express');
var acl = require('../components/acl.js');
// var knex = require('../components/knex.js');

var router = express.Router();

router.get('/', acl.check('home'), function (req, res) {
  res.redirect('/events');
});

module.exports = router;
