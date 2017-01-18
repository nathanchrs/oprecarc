'use strict';

var Joi = require('joi');

module.exports = {

  'user-create': {

    default: Joi.object().keys({
      nim: Joi.string().regex(/^[0-9]{8}$/).required(),
      name: Joi.string().required(),
      gender: Joi.string().regex(/^(male|female)$/).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      line: Joi.string().default('').allow(''),
      password: Joi.string().required(),
      bio: Joi.string().default('').allow('')
    }),

    'admin': Joi.object().keys({
      nim: Joi.string().regex(/^[0-9]{8}$/).required(),
      name: Joi.string().required(),
      gender: Joi.string().regex(/^(male|female)$/).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      line: Joi.string().default('').allow(''),
      password: Joi.string().required(),
      bio: Joi.string().default('').allow(''),
      role: Joi.string().regex(/^(cakru|kru|admin)$/).required()
    })
  },

  'user-edit': {

    default: Joi.object().keys({
      name: Joi.string().required(),
      gender: Joi.string().regex(/^(male|female)$/).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      line: Joi.string().default('').allow(''),
      bio: Joi.string().default('').allow('')
    }),

    'admin': Joi.object().keys({
      name: Joi.string().required(),
      gender: Joi.string().regex(/^(male|female)$/).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      line: Joi.string().default('').allow(''),
      bio: Joi.string().default('').allow(''),
      role: Joi.string().regex(/^(cakru|kru|admin)$/).required()
    })
  }
};


