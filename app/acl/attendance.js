'use strict';

var auth = require('../components/auth.js');

module.exports = {
  'attendance-list': auth.role('admin'),
  'attendance-create': auth.role('admin'),
  'attendance-entry': auth.role('admin'),
  'attendance-delete': auth.role('admin')
};
