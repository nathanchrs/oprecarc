'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var winston = require('./winston.js');
var aclDefinitions = {};

/* Load and register ACL definitions */
var aclDirectory = path.join(__dirname, '../acl');
winston.log('verbose', 'Loading and registering ACL definitions...');
fs.readdirSync(aclDirectory).forEach(function (file) {
  var aclPath = path.join(aclDirectory, file);
  if (path.extname(aclPath) === '.js') {
    winston.log('verbose', 'Registering ACL definitions from %s...', aclPath);
    var aclFile = require(aclPath);
    aclDefinitions = Object.assign(aclDefinitions, aclFile);
  }
});

module.exports = {
  check: function (operation) {
    var aclEntry = _.get(aclDefinitions, operation);
    if (!aclEntry) throw new Error('ACL entry for operation ' + operation + ' not found.');
    return aclEntry;
  }
};