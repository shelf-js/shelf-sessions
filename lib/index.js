// Dependencies
import Shelf from 'shelf'
import extend from 'xtend'

import SessionModel from './helpers/SessionModel'

function ShelfSessions (name, options) {
  this.name = name
  this.ttl = options.ttl
  this._options = {
    jwt: {
      algorithm: options.algorithm,
      audience: options.audience,
      subject: options.subject,
      issuer: options.issues,
      headers: options.headers,
      expiresInMinutes: this.ttl
    },
    shelf: {
      host: options.host,
      port: options.port,
      auth_pass: options.password
    }
  }
  this._shelf = new Shelf(name, this._options.shelf)
}

ShelfSessions.prototype.extend = function (model) {
  let NewModel = extend(this.prototype, SessionModel.prototype)
  return new NewModel(model)
}

export default ShelfSessions
