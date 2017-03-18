'use strict';

var fs = require('fs');
var path = require('path');
var express = require('express');
var winston = require('../components/winston.js');
var knex = require('../components/knex.js');
var acl = require('../components/acl.js');
var validation = require('../components/validation.js');
var uploader = require('../components/uploader.js');

var router = express.Router();

router.get('/submissions', acl.check('submission-table'), function (req, res, next) {
  if (!req.query.sort) req.query.sort = '-created_at';
  knex.select('submissions.id as id', 'user_nim', 'task_id', 'tasks.name as task_name', 'filename', 'slug', 'grade', 'notes', 'submissions.created_at')
    .from('submissions')
    .leftJoin('tasks', 'submissions.task_id', 'tasks.id')
    .search(req.query.search, ['filename', 'user_nim', 'task_name', 'notes'])
    .pageAndSort(req.query.page, req.query.perPage, req.query.sort,
      ['id', 'user_nim', 'task_id', 'filename', 'grade', 'created_at'])
    .then(function (submissions) {
      return res.render('submissions-table', { submissions: submissions });
    })
    .catch(function (err) {
      return next(err);
    });
});

router.get('/submissions/:id([0-9]+/download)', acl.check('submission-download'), function (req, res, next) {
  knex.first('id', 'user_nim', 'filename', 'slug')
    .where('id', req.params.id)
    .from('submissions')
    .then(function (submission) {
      if (!submission) return res.sendStatus(404);
      return res.download(path.join(global.uploadDirectory, submission.slug), submission.filename);
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.post('/submissions', acl.check('submission-create'), uploader.submission,
  validation.validateBody('submission-create', '/tasks'), function (req, res, next) {

  var insertData = {
    user_nim: req.user.nim,
    task_id: req.input.task_id,
    filename: req.file.originalname,
    slug: req.file.filename,
    notes: req.input.notes,
    created_at: new Date(),
    updated_at: new Date()
  };

  knex('submissions').insert(insertData)
    .then(function () {
      winston.log('verbose', 'New submission with name ' + req.input.name + ' created by ' + req.user.nim + '.');
      req.flash('info', 'Submission created.');
      return res.redirect('/tasks/' + req.input.task_id);
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.get('/submissions/:id([0-9]+)/edit', acl.check('submission-edit'), function (req, res, next) {
  knex.first('id', 'user_nim', 'task_id', 'filename', 'slug', 'grade', 'notes', 'created_at')
  .where('id', req.params.id).from('submissions')
    .then(function (submission) {
      if (!submission) return res.sendStatus(404);
      return res.render('submission-edit', { submission: submission });
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.put('/submissions/:id([0-9]+)', acl.check('submission-edit'),
  validation.validateBody('submission-edit', function (req) { return '/submissions/' + req.params.id + '/edit'; }),
  function (req, res, next) {

  var updateData = {
    filename: req.input.filename,
    grade: req.input.grade,
    notes: req.input.notes,
    updated_at: new Date()
  };

  knex('submissions').where('id', req.params.id).update(updateData)
    .then(function (submission) {
      winston.log('verbose', 'Submission ' + req.params.id + ' modified by ' + req.user.nim + '.');
      req.flash('info', 'Submission with ID ' + req.params.id + ' updated.');
      return res.redirect('/submissions');
    })
    .catch(function (err) {
      return next(err);
    }); 
});

router.delete('/submissions/:id([0-9]+)', acl.check('submission-delete'), function (req, res, next) {
  knex.first('id', 'user_nim', 'task_id', 'filename', 'slug', 'grade', 'notes', 'created_at')
  .where('id', req.params.id).from('submissions')
    .then(function (submission) {
      if (!submission) {
        req.flash('info', 'No submission with ID ' + req.params.id + ' found.');
        return res.redirect('/submissions');
      } else {
        // Delete file
        fs.unlink(path.join(global.uploadDirectory, submission.slug), function (err) {
          // Delete record
          knex('submissions').where('id', req.params.id).del()
            .then(function (affectedRowCount) {
              winston.log('verbose', 'Submission ' + req.params.id
              + ' deleted (' + affectedRowCount + ' affected rows) by ' + req.user.nim + '.');
              req.flash('info', 'Submission with ID ' + req.params.id + ' deleted.');
              return res.redirect('/submissions');
            })
            .catch(function (err) {
              return next(err);
            });
        });
      }
    })
    .catch(function (err) {
      return next(err);
    }); 
});

module.exports = router;
