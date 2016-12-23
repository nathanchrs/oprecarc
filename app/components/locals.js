'use strict';

var _ = require('lodash');

/* Copies some request data to res.locals so they can be accessed by templates */
module.exports = function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.toasts = _.concat(req.flash('error'), req.flash('info'));
  res.locals.oldInput = req.flash('oldInput')[0];
  next();
};
