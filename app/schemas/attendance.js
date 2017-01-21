'use strict';

var Joi = require('joi');

module.exports = {

  'attendance-create': {

    default: Joi.object().keys({
      timestamp: Joi.date(),
      user_nim: Joi.number().integer().positive().required(),
      event_id: Joi.number().integer().positive().required(),
      notes: Joi.string().default('').allow('')
    })
  },

  'attendance-entry': {

    default: Joi.object().keys({
      user_nim: Joi.number().integer().positive().required(),
      notes: Joi.string().default('').allow('')
    })
  }
};


