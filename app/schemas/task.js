'use strict';

var Joi = require('joi');

module.exports = {

  'task-create': {

    default: Joi.object().keys({
      name: Joi.string().required(),
      deadline: Joi.date(),
      description: Joi.string().default('').allow('')
    })
  },

  'task-edit': {

    default: Joi.object().keys({
      name: Joi.string().required(),
      deadline: Joi.date(),
      description: Joi.string().default('').allow('')
    })
  }
};
