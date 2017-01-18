'use strict';

var Joi = require('joi');

module.exports = {

  'event-create': {

    default: Joi.object().keys({
      name: Joi.string().required(),
      start_time: Joi.date(),
      end_time: Joi.date(),
      late_time: Joi.date(),
      description: Joi.string().default('').allow('')
    })
  },

  'event-edit': this['event-create']
};


