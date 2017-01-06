'use strict';

var Joi = require('joi');

var joiOptions = {};

module.exports = {
  validate: function (value, schema) {
    return Joi.validate(value, schema, joiOptions);
  },

  errorRedirect: function (error, redirectTo, req, res) {
    error.details.forEach(function (err) { req.flash('error', err.message) });
    req.flash('validationError', error);
    req.flash('oldInput', error._object);
    return res.redirect(redirectTo);
  }
};
