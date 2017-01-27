'use strict';

var Joi = require('joi');

module.exports = {

  'submission-create': {

    default: Joi.object().keys({
      name: Joi.string().required(),
      start_time: Joi.date(),
      end_time: Joi.date().min(Joi.ref('start_time')),
      late_time: Joi.date().min(Joi.ref('start_time')).max(Joi.ref('end_time')),
      description: Joi.string().default('').allow('')
    }),

    admin: Joi.object().keys({
      name: Joi.string().required(),
      start_time: Joi.date(),
      end_time: Joi.date().min(Joi.ref('start_time')),
      late_time: Joi.date().min(Joi.ref('start_time')).max(Joi.ref('end_time')),
      description: Joi.string().default('').allow('')
    })
  }
};
