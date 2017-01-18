'use strict';

var Joi = require('joi');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var winston = require('./winston.js');

var joiOptions = {};
var schemas = {};

/* Load and register schemas */
var schemaDirectory = path.join(__dirname, '../schemas');
winston.log('verbose', 'Loading and registering schemas...');
fs.readdirSync(schemaDirectory).forEach(function (file) {
  var schemaPath = path.join(schemaDirectory, file);
  if (path.extname(schemaPath) === '.js') {
    winston.log('verbose', 'Registering schemas from %s...', schemaPath);
    var schemaFile = require(schemaPath);
    schemas = Object.assign(schemas, schemaFile);
  }
});

module.exports = {

  errorRedirect: function (error, redirectTo, req, res) {
    error.details.forEach(function (err) { req.flash('error', err.message) });
    req.flash('validationError', error);
    req.flash('oldInput', error._object);
    return res.redirect(redirectTo);
  },

  /* Validates req.body using the schema for the specified operation, then stores validated input in req.input */
  validateBody: function (operation, errorRedirectPath) {
    var _validation = this;
    return function (req, res, next) {
      var role = req.user ? req.user.role : 'unauthenticated';
      var schemasForOperation = _.get(schemas, operation);
      if (!schemasForOperation) return next(new Error('Validation schema for ' + operation + ' not found.'));
      var schema = _.get(schemasForOperation, role, _.get(schemasForOperation, 'default'));
      if (!schema) return next(new Error('Validation schema for ' + operation + ', role ' + role + ' not found; no default schema.'));
      
      var input = Joi.validate(req.body, schema, joiOptions);
      if (input.error) {
        if (_.isFunction(errorRedirectPath)) errorRedirectPath = errorRedirectPath(req);
        if (!errorRedirectPath) errorRedirectPath = req.originalUrl;
        return _validation.errorRedirect(input.error, errorRedirectPath, req, res);
      }
      req.input = input.value;
      next();
    };
  }

};
