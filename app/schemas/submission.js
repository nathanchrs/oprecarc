'use strict';

var Joi = require('joi');

module.exports = {

  'submission-create': {

    default: Joi.object().keys({
      task_id: Joi.number().integer().positive().required(),
      submission_file: Joi.any()
    }),

    admin: Joi.object().keys({
      task_id: Joi.number().integer().positive().required(),
      submission_file: Joi.any()
    }),
  },

  'submission-edit': {

    default: Joi.object().keys({
      notes: Joi.string().default('').allow('')
    }),

    admin: Joi.object().keys({
      filename: Joi.string().required(),
      notes: Joi.string().default('').allow(''),
      grade: Joi.number().integer().positive()
    }),
  }

};
