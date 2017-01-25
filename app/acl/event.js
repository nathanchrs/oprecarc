'use strict';

var auth = require('../components/auth.js');

module.exports = {
  'event-list': auth.isLoggedIn,
  'event-info': auth.isLoggedIn,
  'event-table': auth.role('admin'),
  'event-create': auth.role('admin'),
  'event-edit': auth.role('admin'),
  'event-delete': auth.role('admin')
};
