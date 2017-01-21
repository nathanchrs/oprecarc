'use strict';

var express = require('express');
var winston = require('../components/winston.js');
var knex = require('../components/knex.js');
var acl = require('../components/acl.js');
var validation = require('../components/validation.js');

var router = express.Router();

router.get('/attendances', acl.check('attendance-list'), function (req, res, next) {
  knex.select('attendances.id as id', 'timestamp', 'user_nim', 'users.name as user_name', 'event_id', 'events.name as event_name', 'notes')
    .from('attendances')
    .leftJoin('users', 'attendances.user_nim', 'users.nim')
    .leftJoin('events', 'attendances.event_id', 'events.id')
    .search(req.query.search, ['timestamp', 'user_nim', 'user_name', 'event_name', 'notes'])
    .pageAndSort(req.query.page, req.query.perPage, req.query.sort,
      ['id', 'timestamp', 'user_nim', 'user_name', 'event_name'])
    .then(function (attendances) {
      return res.render('attendances', { attendances: attendances });
    })
    .catch(function (err) {
      return next(err);
    });
});

router.get('/attendances/create', acl.check('attendance-create'), function (req, res) {
  res.render('attendance-edit'); // Reused attendance-edit template for create.
});

// TODO: handle duplicate attendance entry per event and user
router.post('/attendances', acl.check('attendance-create'),
  validation.validateBody('attendance-create', '/attendances/create'), function (req, res, next) {

  var insertData = {
    timestamp: req.input.timestamp,
    user_nim: req.input.user_nim,
    event_id: req.input.event_id,
    notes: req.input.notes
  };

  // Check whether the specified NIM exists
  knex.select('nim').from('users').where('nim', req.input.user_nim).first()
    .then(function (nimResult) {
      if (!nimResult) return validation.errorRedirect({
          details: [{ message: 'NIM does not exist.', path: 'user_nim' }],
          _object: req.body
        }, '/attendances/create', req, res);

      // Check whether the specified event ID exists
      knex.select('id').from('events').where('id', req.input.event_id).first()
        .then(function (idResult) {
          if (!idResult) return validation.errorRedirect({
              details: [{ message: 'Event with the specified ID does not exist.', path: 'event_id' }],
              _object: req.body
            }, '/attendances/create', req, res);

          knex('attendances').insert(insertData)
            .then(function () {
              winston.log('verbose', 'New attendance entry for user ' + req.input.user_nim + ', event ' + req.input.event_id + ' created manually by ' + req.user.nim + '.');
              req.flash('info', 'Attendance saved.');
              return res.redirect('/attendances');
            })
            .catch(function (err) {
              return next(err);
            }); 
        })
        .catch(function (err) {
          return next(err);
        });
    })
    .catch(function (err) {
      return next(err);
    });
});

router.get('/events/:id([0-9]+)/attendances/entry', acl.check('attendance-entry'), function (req, res, next) {
  knex.first('id', 'name', 'start_time', 'end_time', 'late_time', 'description', 'created_at', 'updated_at')
    .where('id', req.params.id)
    .from('events')
    .then(function (event) {
      if (!event) return res.sendStatus(404);

      knex.select('attendances.id as id', 'timestamp', 'user_nim', 'users.name as user_name', 'event_id', 'events.name as event_name', 'notes')
        .from('attendances')
        .leftJoin('users', 'attendances.user_nim', 'users.nim')
        .leftJoin('events', 'attendances.event_id', 'events.id')
        .where('event_id', req.params.id)
        .orderBy('timestamp', 'desc')
        .then(function (attendances) {
          return res.render('attendance-entry', { attendances: attendances, event: event });
        })
        .catch(function (err) {
          return next(err);
        });
    })
    .catch(function (err) {
      return next(err);
    }); 
});

// TODO: handle duplicate attendance entry per event and user
router.post('/events/:id([0-9]+)/attendances/entry', acl.check('attendance-entry'),
  validation.validateBody('attendance-entry', '/attendances/entry'), function (req, res, next) {

  var insertData = {
    timestamp: new Date(),
    user_nim: req.input.user_nim,
    event_id: req.params.id,
    notes: req.input.notes
  };

  // Check whether the specified NIM exists
  knex.select('nim').from('users').where('nim', req.input.user_nim).first()
    .then(function (nimResult) {
      if (!nimResult) return validation.errorRedirect({
          details: [{ message: 'NIM does not exist.', path: 'user_nim' }],
          _object: req.body
        }, '/events/' + req.params.id + '/attendances/entry', req, res);

      // Check whether the specified event ID exists
      knex.select('id').from('events').where('id', req.params.id).first()
        .then(function (idResult) {
          if (!idResult) return res.sendStatus(404);

          knex('attendances').insert(insertData)
            .then(function () {
              winston.log('verbose', 'New attendance entry for user ' + req.input.user_nim + ', event ' + req.params.id + ' created by ' + req.user.nim + '.');
              req.flash('info', 'Attendance saved.');
              return res.redirect('/events/' + req.params.id + '/attendances/entry');
            })
            .catch(function (err) {
              return next(err);
            }); 
        })
        .catch(function (err) {
          return next(err);
        });
    })
    .catch(function (err) {
      return next(err);
    });
});

router.delete('/attendances/:id([0-9]+)', acl.check('attendance-delete'), function (req, res, next) {
  knex('attendances').where('id', req.params.id).del()
    .then(function (affectedRowCount) {
      if (affectedRowCount > 0) {
        winston.log('verbose', 'Attendance entry ' + req.params.id
          + ' deleted (' + affectedRowCount + ' affected rows) by ' + req.user.nim + '.');
        req.flash('info', 'Attendance entry ' + req.params.id + ' deleted.');
      } else {
        req.flash('info', 'No attendance entry with ID ' + req.params.id + ' found.');
      }
      return res.redirect('/attendances');
    })
    .catch(function (err) {
      return next(err);
    });
});

module.exports = router;
