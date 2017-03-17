'use strict';

var auth = require('../components/auth.js');

module.exports = {
  'submission-list': auth.role('admin'),
  'submission-info': auth.isLoggedIn,
  'submission-create': auth.isLoggedIn,
  'submission-edit': auth.role('admin'),
  'submission-delete': auth.role('admin')
};
