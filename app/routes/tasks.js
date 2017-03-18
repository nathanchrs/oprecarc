'use strict';

var express = require('express');
var winston = require('../components/winston.js');
var knex = require('../components/knex.js');
var acl = require('../components/acl.js');
var validation = require('../components/validation.js');

var router = express.Router();

router.get('/tasks', acl.check('task-list'), function (req, res, next) {
  if (!req.query.sort) req.query.sort = 'deadline';
  knex.select('id', 'name', 'deadline', 'created_at', 'updated_at')
    .from('tasks')
    .search(req.query.search, ['name'])
    .pageAndSort(req.query.page, req.query.perPage, req.query.sort,
      ['id', 'name', 'deadline', 'end_time', 'created_at', 'updated_at'])
    .then(function (tasks) {
      return res.render('tasks', { tasks: tasks });
    })
    .catch(function (err) {
      return next(err);
    });
});

router.get('/tasks-table', acl.check('task-table'), function (req, res, next) {
  if (!req.query.sort) req.query.sort = 'deadline';
  knex.select('id', 'name', 'deadline', 'created_at', 'updated_at')
    .from('tasks')
    .search(req.query.search, ['name'])
    .pageAndSort(req.query.page, req.query.perPage, req.query.sort,
      ['id', 'name', 'deadline', 'end_time', 'created_at', 'updated_at'])
    .then(function (tasks) {
      return res.render('tasks-table', { tasks: tasks });
    })
    .catch(function (err) {
      return next(err);
    });
});

router.get('/tasks/:id([0-9]+)', acl.check('task-info'), function (req, res, next) {
  knex.first('id', 'name', 'deadline', 'description', 'created_at', 'updated_at')
    .where('id', req.params.id)
    .from('tasks')
    .then(function (task) {
      if (!task) return res.sendStatus(404);
      return knex.select('id', 'filename', 'slug', 'grade', 'notes', 'created_at')
        .from('submissions')
        .where('task_id', task.id)
        .andWhere('user_nim', req.user.nim)
        .orderBy('created_at', 'desc')
        .then(function (submissions) {
          return res.render('task', { task: task, submissions: submissions });
        })
        .catch(function (err) {
          return next(err);
        });
    })
    .catch(function (err) {
      return next(err);
    });
});

router.get('/tasks/create', acl.check('task-create'), function (req, res) {
  res.render('task-edit'); // Reused task-edit template for create.
});

router.post('/tasks', acl.check('task-create'),
  validation.validateBody('task-create', '/tasks/create'), function (req, res, next) {

  var insertData = {
    name: req.input.name,
    deadline: req.input.deadline,
    description: req.input.description,
    created_at: new Date(),
    updated_at: new Date()
  };

  knex('tasks').insert(insertData)
    .then(function () {
      winston.log('verbose', 'New task with name ' + req.input.name + ' created by ' + req.user.nim + '.');
      req.flash('info', 'Task created.');
      return res.redirect('/tasks');
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.get('/tasks/:id([0-9]+)/edit', acl.check('task-edit'), function (req, res, next) {
  knex.first('id', 'name', 'deadline', 'description', 'created_at', 'updated_at')
  .where('id', req.params.id).from('tasks')
    .then(function (task) {
      if (!task) return res.sendStatus(404);
      return res.render('task-edit', { task: task });
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.put('/tasks/:id([0-9]+)', acl.check('task-edit'),
  validation.validateBody('task-edit', function (req) { return '/tasks/' + req.params.id + '/edit'; }),
  function (req, res, next) {

  var updateData = {
    name: req.input.name,
    deadline: req.input.deadline,
    description: req.input.description,
    updated_at: new Date()
  };

  knex('tasks').where('id', req.params.id).update(updateData)
    .then(function (task) {
      winston.log('verbose', 'Task ' + req.params.id + ' modified by ' + req.user.nim + '.');
      req.flash('info', 'Task with ID ' + req.params.id + ' updated.');
      return res.redirect('/tasks/' + req.params.id);
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.delete('/tasks/:id([0-9]+)', acl.check('task-delete'), function (req, res, next) {
  knex('tasks').where('id', req.params.id).del()
    .then(function (affectedRowCount) {
      if (affectedRowCount > 0) {
        winston.log('verbose', 'Task ' + req.params.id
          + ' deleted (' + affectedRowCount + ' affected rows) by ' + req.user.nim + '.');
        req.flash('info', 'Task with ID ' + req.params.id + ' deleted.');
      } else {
        req.flash('info', 'No task with ID ' + req.params.id + ' found.');
      }
      return res.redirect('/tasks');
    })
    .catch(function (err) {
      return next(err);
    });
});

module.exports = router;
