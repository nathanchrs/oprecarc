'use strict';

var express = require('express');
var winston = require('../components/winston.js');
var knex = require('../components/knex.js');
var acl = require('../components/acl.js');
var validation = require('../components/validation.js');

var router = express.Router();

router.get('/events', acl.check('event-list'), function (req, res, next) {
  if (!req.query.sort) req.query.sort = '-start_time';
  knex.select('id', 'name', 'start_time', 'end_time', 'late_time', 'created_at', 'updated_at')
    .from('events')
    .search(req.query.search, ['name'])
    .pageAndSort(req.query.page, req.query.perPage, req.query.sort,
      ['id', 'name', 'start_time', 'end_time', 'created_at', 'updated_at'])
    .then(function (events) {
      return res.render('events', { events: events });
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.get('/events-table', acl.check('event-table'), function (req, res, next) {
  if (!req.query.sort) req.query.sort = '-start_time';
  knex.select('id', 'name', 'start_time', 'end_time', 'late_time', 'description', 'created_at', 'updated_at')
    .from('events')
    .search(req.query.search, ['name'])
    .pageAndSort(req.query.page, req.query.perPage, req.query.sort,
      ['id', 'name', 'start_time', 'end_time', 'late_time', 'created_at', 'updated_at'])
    .then(function (events) {
      return res.render('events-table', { events: events });
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.get('/events/:id([0-9]+)', acl.check('event-info'), function (req, res, next) {
  knex.first('id', 'name', 'start_time', 'end_time', 'late_time', 'description', 'created_at', 'updated_at')
    .where('id', req.params.id)
    .from('events')
    .then(function (event) {
      if (!event) return res.sendStatus(404);
      return res.render('event', { event: event });
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.get('/events/create', acl.check('event-create'), function (req, res) {
  res.render('event-edit'); // Reused event-edit template for create.
});

router.post('/events', acl.check('event-create'),
  validation.validateBody('event-create', '/events/create'), function (req, res, next) {

  var insertData = {
    name: req.input.name,
    start_time: req.input.start_time,
    end_time: req.input.end_time,
    late_time: req.input.late_time,
    description: req.input.description,
    created_at: new Date(),
    updated_at: new Date()
  };

  knex('events').insert(insertData)
    .then(function () {
      winston.log('verbose', 'New event with name ' + req.input.name + ' created by ' + req.user.nim + '.');
      req.flash('info', 'Event created.');
      return res.redirect('/events');
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.get('/events/:id([0-9]+)/edit', acl.check('event-edit'), function (req, res, next) {
  knex.first('id', 'name', 'start_time', 'end_time', 'late_time', 'description', 'created_at', 'updated_at')
  .where('id', req.params.id).from('events')
    .then(function (event) {
      if (!event) return res.sendStatus(404);
      return res.render('event-edit', { event: event });
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.put('/events/:id([0-9]+)', acl.check('event-edit'),
  validation.validateBody('event-edit', function (req) { return '/events/' + req.params.id + '/edit'; }),
  function (req, res, next) {

  var updateData = {
    name: req.input.name,
    start_time: req.input.start_time,
    end_time: req.input.end_time,
    late_time: req.input.late_time,
    description: req.input.description,
    updated_at: new Date()
  };

  knex('events').where('id', req.params.id).update(updateData)
    .then(function (event) {
      winston.log('verbose', 'Event ' + req.params.id + ' modified by ' + req.user.nim + '.');
      req.flash('info', 'Event with ID ' + req.params.id + ' updated.');
      return res.redirect('/events/' + req.params.id);
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.delete('/events/:id([0-9]+)', acl.check('event-delete'), function (req, res, next) {
  knex('events').where('id', req.params.id).del()
    .then(function (affectedRowCount) {
      if (affectedRowCount > 0) {
        winston.log('verbose', 'Event ' + req.params.id
          + ' deleted (' + affectedRowCount + ' affected rows) by ' + req.user.nim + '.');
        req.flash('info', 'Event with ID ' + req.params.id + ' deleted.');
      } else {
        req.flash('info', 'No event with ID ' + req.params.id + ' found.');
      }
      return res.redirect('/events');
    })
    .catch(function (err) {
      return next(err);
    });
});

module.exports = router;
