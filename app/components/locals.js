'use strict';

var _ = require('lodash');
var qs = require('qs');

/* Utility function that returns first non-null and non-undefined element from its parameters.
 * If an empty values array is given, undefined is returned.
 * If an no non-null or non-undefined element is present, the last element will be returned.
 * An empty string is considered a non-empty value.
 */
var coalesce = function () {
  var result;
  for (var i = 0; i < arguments.length; i++) {
    result = arguments[i];
    if (result !== undefined && result !== null) return result;
  }
  return result;
};

/* Copies some request data to res.locals so they can be accessed by templates */
module.exports = function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.toasts = _.concat(req.flash('error'), req.flash('info'));
  res.locals.oldInput = req.flash('oldInput')[0];
  res.locals.validationError = req.flash('validationError')[0];
  res.locals.coalesce = coalesce;
  res.locals._ = _;
  res.locals.qs = qs;
  res.locals.req = req;
  next();
};
