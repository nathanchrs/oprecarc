'use strict';

var Joi = require('joi');

module.exports = {

  'submission-create': {

    default: Joi.object().keys({
      user_nim: Joi.number().integer().positive().required(),
      task_id: Joi.number().integer().positive().required(),
      notes: Joi.string().default('').allow(''),
    }),

    admin: Joi.object().keys({
      user_nim: Joi.number().integer().positive().required(),
      task_id: Joi.number().integer().positive().required(),
      notes: Joi.string().default('').allow(''),
      grade: Joi.number().integer().positive()
    }),
  },

  'submission-edit': {

    default: Joi.object().keys({
      notes: Joi.string().default('').allow('')
    }),

    admin: Joi.object().keys({
      user_nim: Joi.number().integer().positive().required(),
      task_id: Joi.number().integer().positive().required(),
      filename: Joi.string().required(),
      notes: Joi.string().default('').allow(''),
      grade: Joi.number().integer().positive()
    }),
  }

};
