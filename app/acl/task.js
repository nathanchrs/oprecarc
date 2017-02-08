'use strict';

var auth = require('../components/auth.js');

module.exports = {
  'task-list': auth.isLoggedIn,
  'task-info': auth.isLoggedIn,
  'task-create': auth.role('admin'),
  'task-edit': auth.role('admin'),
  'task-delete': auth.role('admin')
};
