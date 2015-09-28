import Async from 'async'
import jwt from 'jsonwebtoken'

function SessionModel (shelf, model) {
  if (!shelf) {
    throw new Error('Uninitialized shelf. Unable to create session model.')
  }
  this._Scopes = shelf.extend({
    name: 'scope',
    props: {
      user: 'string',
      scope: 'string',
      jwt: 'string'
    },
    keys: ['user', 'scope']
  })
  this._Sessions = shelf.extend(model)
}

SessionModel.prototype.deleteSession = function () {
  // TODO
}

SessionModel.prototype.getUserSessions = function () {
  // TODO
}

SessionModel.prototype._createSession = function (user, scope, sessionInfo, cb) {
  // TODO handle user own defined props for session model

  let jwtOptions = this._options.jwt
  let secret = this._options.secret
  let payload = {
    user,
    scope
  }
  let token = jwt.sign(payload, secret, jwtOptions)
  let now = Date.now()
  let scopeModel = new this._Scopes({user: user, scope: scope, jwt: token.toString()})
  let sessionModel = new this._Sessions({
    devices: [sessionInfo.devices],
    scope,
    user,
    jwt: token.toString(),
    created: now,
    lastAccess: now
  })
  Async.parallel([
    sessionModel.saveWithTTL.bind(sessionModel, this.ttl),
    scopeModel.saveWithTTL.bind(scopeModel, this.ttl)
  ], (err, results) => {
    results = results || results[0]
    return cb(err, results)
  })
}

SessionModel.prototype._addSession = function (token, sessionInfo, cb) {
  this._Sessions.get({jwt: token}, (err, model) => {
    if (err) { return cb(err) }
    model.devices.push(sessionInfo)
    model.devices.save(cb)
  })
}

SessionModel.prototype.getSession = function (user, scopes, sessionInfo, cb) {
  if (Array.isArray(scopes)) {
    let scopesKey = ''
    scopes.sort()
    scopes.forEach(function (scope) {
      scopesKey += scopesKey ? '-' : ''
      scopesKey += scope
    })
    scopes = scopesKey
  }
  Async.waterfall([
    Async.apply(this._Scopes.get, {user: user, scope: scopes}),
    (token, cbAsync = token) => {
      if (typeof token === 'function') {
        return this._createSession(user, scopes, sessionInfo, cbAsync)
      }
      return this._addSession(token, sessionInfo, cbAsync)
    }
  ], cb)
}

SessionModel.prototype.authenticate = function (token, cb) {
  let model = {}
  Async.waterfall([
    Async.apply(this._Sessions.get, {jwt: token}),
    (sessionModel, cbAsync = sessionModel) => {
      if (typeof sessionModel === 'function') {
        return cb('Session not found for token - ' + token)
      }
      let jwtOptions = {
        audience: this._options.jwt.audience,
        issuer: this._options.jwt.issuer
      }
      model = sessionModel
      jwt.verify(sessionModel.jwt, this.secret, jwtOptions, cbAsync)
    }],
    (err, decoded) => {
      if (err) { return cb(err) }
      return cb(null, {model, decoded})
    })
}

export default SessionModel
