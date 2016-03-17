'use strict'

const Lab = require('lab')
const Code = require('code')
const Async = require('async')
const lab = exports.lab = Lab.script()
const ShelfSessions = require('../../index')

lab.experiment('Session model - authenticate', () => {
  lab.test('Non existent token', (done) => {
    let sessions = ShelfSessions('test-name', 'string-secret').extend({name: 'foobar'})
    sessions.authenticate('abc', (err) => {
      Code.expect(err).not.to.be.null()
      Code.expect(err).to.be.instanceof(Error)
      Code.expect(err.message).to.be.equal('Session not found for token - abc')
      done()
    })
  })

  lab.test('Authenticate with success', (done) => {
    let sessions = ShelfSessions('test-name', 'string-secret').extend({name: 'foobar'})
    Async.waterfall([
      sessions.createSession.bind(sessions, {
        userId: 'test',
        scopes: ['default']
      }),
      (model, cb) => {
        Code.expect(model).to.be.an.object()
        Code.expect(model.jwt).to.be.a.string()
        sessions.authenticate(model.jwt, cb)
      }
    ], (err) => {
      Code.expect(err).to.be.null()
      done()
    })
  })
})
