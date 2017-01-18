'use strict';

var _ = require('lodash');
var qs = require('qs');
var moment = require('moment');
var marked = require('marked');

/* Utility constants */
var constants = {
  genders: {
    male: 'Male',
    female: 'Female'
  },

  roles: {
    kru: 'Kru',
    cakru: 'Cakru',
    admin: 'Admin'
  }
};

/* Utility functions */
var utils = {

/* Utility function that returns first non-null and non-undefined element from its parameters.
 * If an empty values array is given, undefined is returned.
 * If an no non-null or non-undefined element is present, the last element will be returned.
 * An empty string is considered a non-empty value.
 */
  coalesce: function () {
    var result;
    for (var i = 0; i < arguments.length; i++) {
      result = arguments[i];
      if (result !== undefined && result !== null) return result;
    }
    return result;
  },

  toOptionArray: function (obj) {
    var res = [];
    for (var key in obj) {
      res.push({ value: key, description: obj[key] });
    }
    return res;
  },

  removeQuotes: function (str) {
    return str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
  }
}

/* Copies some request data to res.locals so they can be accessed by templates */
module.exports = function (req, res, next) {
  res.locals.req = req;
  res.locals.toasts = _.concat(req.flash('error'), req.flash('info'));
  res.locals.oldInput = req.flash('oldInput')[0];
  res.locals.validationError = req.flash('validationError')[0];

  res.locals.constants = constants;
  res.locals.utils = utils;

  res.locals._ = _;
  res.locals.qs = qs;
  res.locals.moment = moment;
  res.locals.marked = marked;

  next();
};
