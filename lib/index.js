// Dependencies
import Shelf from 'shelf'
import extend from 'xtend'

import SessionModel from './helpers/SessionModel'

function ShelfSessions (name, options = {}) {
  // TODO enforce specific options
  // Required fields:
  // secret
  // userId
  this.appName = name
  this.ttl = options.ttl || 3 * 60 * 24 // defaults to 3 days
  this._options = {}
  this._options.jwt = {
    algorithm: options.algorithm,
    audience: options.audience,
    subject: options.subject,
    issuer: options.issues,
    headers: options.headers,
    expiresInMinutes: this.ttl
  }
  this._options.shelf = options.shelf ? {} : {
    host: options.host,
    port: options.port,
    auth_pass: options.password
  }
  this._options.secret = options.secret
  this._shelf = options.shelf || new Shelf(name, this._options.shelf)
}

ShelfSessions.prototype.extend = function (model = {}) {
  // TODO enforce specific type checks and props validation
  // without screwing up used defined fields
  // Required fields:
  // scope
  // created
  // user
  // devices ?

  // Ugly stuff, use ES7 rest props instead
  model.props = model.props || {}
  model.props.devices = 'any'
  model.props.jwt = 'string'
  model.props.user = 'string'
  model.props.scope = 'string'
  model.props.created = 'number'
  model.props.lastAccess = 'number'
  model.keys = model.keys || []
  model.keys.unshift('user', 'jwt')
  let NewModel = extend(this.prototype, SessionModel.prototype)
  return new NewModel(model)
}

export default ShelfSessions
