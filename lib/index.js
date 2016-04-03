'use strict'

const Shelf = require('shelf')
const Joi = require('joi')

const SessionModel = require('./helpers/SessionModel')
const extendJoi = require('./helpers/extendJoi')

const DefaultModel = Joi.object().keys({
  jwt: Joi.string().required(),
  userId: Joi.string().required(),
  scopes: Joi.array().min(1).required()
})

function ShelfSessions (name, secret, opts) {
  if (!secret || (typeof secret !== 'string' && !Buffer.isBuffer(secret))) {
    throw new Error('You need to define a valid secret')
  }
  opts = opts || {}
  let parsedOpts = {}
  let defaultModel = extendJoi(DefaultModel, opts.defaultProps)
  let shelf
  parsedOpts.jwt = {
    algorithm: opts.algorithm,
    audience: opts.audience,
    subject: opts.subject,
    issuer: opts.issuer,
    headers: opts.headers,
    expiresIn: opts.ttl || 3 * 24 * 60 * 60 // defaults to 3 days
  }
  parsedOpts.shelf = opts.shelf ? {} : {
    host: opts.host,
    port: opts.port,
    auth_pass: opts.password
  }
  parsedOpts.secret = secret
  shelf = opts.shelf || Shelf(name, parsedOpts.shelf)

  function extend (model) {
    model = Object.assign({}, model)
    model.name = model.name

    // Overrides provided keys
    model.keys = ['jwt']

    model.props = extendJoi(defaultModel, model.props)

    return new SessionModel(shelf, model, parsedOpts)
  }

  return {extend}
}

module.exports = ShelfSessions
