'use strict';

var auth = require('../components/auth.js');

module.exports = {
  'submission-table': auth.role('admin'),
  'submission-download': auth.isLoggedIn,
  'submission-create': auth.isLoggedIn,
  'submission-edit': auth.role('admin'),
  'submission-delete': auth.role('admin')
};
