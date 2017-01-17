'use strict';

var Joi = require('joi');

module.exports = {
  userUpdateSchema: Joi.object().keys({
    name: Joi.string().required(),
    gender: Joi.string().regex(/^(male|female)$/).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    line: Joi.string().default('').allow(''),
    bio: Joi.string().default('').allow('')
  }),

  userUpdateAdminSchema: Joi.object().keys({
    name: Joi.string().required(),
    gender: Joi.string().regex(/^(male|female)$/).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    line: Joi.string().default('').allow(''),
    bio: Joi.string().default('').allow(''),
    role: Joi.string().regex(/^(cakru|kru|admin)$/).required()
  }),

  userInsertSchema: Joi.object().keys({
    nim: Joi.string().regex(/^[0-9]{8}$/).required(),
    name: Joi.string().required(),
    gender: Joi.string().regex(/^(male|female)$/).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    line: Joi.string().default('').allow(''),
    password: Joi.string().required(),
    bio: Joi.string().default('').allow('')
  }),

  userInsertAdminSchema: Joi.object().keys({
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

};


