'use strict'

const Async = require('async')
const jwt = require('jsonwebtoken')

function SessionModel (shelf, model, options) {
  if (!shelf) {
    throw new Error('Uninitialized shelf. Unable to create session model.')
  }
  let sessions = shelf.extend(model)
  let Model = {
    deleteSession,
    createSession,
    authenticate
  }

  function deleteSession (token, cb) {
    sessions.del({jwt: token}, cb)
  }

  function createSession (session, cb) {
    if (!session || typeof session !== 'object') {
      return cb(new Error('Session must be an object'))
    }
    if (!session.userId || typeof session.userId !== 'string') {
      return cb(new Error('User id must be a non-empty string'))
    }
    if (!Array.isArray(session.scopes) || session.scopes.length < 1) {
      return cb(new Error('Scopes must be a non-empty array'))
    }
    let jwtOptions = options.jwt
    let secret = options.secret
    let userId = session.userId
    let scopes = session.scopes
    let payload = {
      userId,
      scopes
    }
    session.jwt = jwt.sign(payload, secret, jwtOptions)
    let sessionModel = sessions(session)
    sessionModel.saveWithTTL(jwtOptions.expiresIn, (err, result) => {
      if (err) return cb(err)
      return cb(null, sessionModel)
    })
  }

  function authenticate (token, cb) {
    let resultModel = {}
    Async.waterfall([
      Async.apply(sessions.get, {jwt: token}),
      (model, cbAsync) => {
        if (!model) {
          return cb(new Error('Session not found for token - ' + token))
        }
        let jwtOptions = {
          audience: options.jwt.audience,
          issuer: options.jwt.issuer
        }
        resultModel = model
        jwt.verify(model.jwt, options.secret, jwtOptions, cbAsync)
      }],
      (err, decoded) => {
        if (err) { return cb(err) }
        return cb(null, resultModel)
      })
  }

  return Model
}

module.exports = SessionModel
