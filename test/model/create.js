'use strict'

const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const ShelfSessions = require('../../index')

lab.experiment('Session model - create', () => {
  lab.test('No session object', (done) => {
    let sessions = ShelfSessions('test-name', 'string-secret').extend({name: 'foobar'})
    sessions.createSession(null, (err) => {
      Code.expect(err).not.to.be.null()
      Code.expect(err).to.be.instanceof(Error)
      Code.expect(err.message).to.be.equal('Session must be an object')
      done()
    })
  })

  lab.test('No user id', (done) => {
    let sessions = ShelfSessions('test-name', 'string-secret').extend({name: 'foobar'})
    sessions.createSession({
      scopes: ['default']
    }, (err) => {
      Code.expect(err).not.to.be.null()
      Code.expect(err).to.be.instanceof(Error)
      Code.expect(err.message).to.be.equal('User id must be a non-empty string')
      done()
    })
  })

  lab.test('Invalid user id', (done) => {
    let sessions = ShelfSessions('test-name', 'string-secret').extend({name: 'foobar'})
    sessions.createSession({
      userId: 123,
      scopes: ['default']
    }, (err) => {
      Code.expect(err).not.to.be.null()
      Code.expect(err).to.be.instanceof(Error)
      Code.expect(err.message).to.be.equal('User id must be a non-empty string')
      done()
    })
  })

  lab.test('No scopes', (done) => {
    let sessions = ShelfSessions('test-name', 'string-secret').extend({name: 'foobar'})
    sessions.createSession({
      userId: 'user'
    }, (err) => {
      Code.expect(err).not.to.be.null()
      Code.expect(err).to.be.instanceof(Error)
      Code.expect(err.message).to.be.equal('Scopes must be a non-empty array')
      done()
    })
  })

  lab.test('Invalid scopes', (done) => {
    let sessions = ShelfSessions('test-name', 'string-secret').extend({name: 'foobar'})
    sessions.createSession({
      userId: 'user',
      scopes: []
    }, (err) => {
      Code.expect(err).not.to.be.null()
      Code.expect(err).to.be.instanceof(Error)
      Code.expect(err.message).to.be.equal('Scopes must be a non-empty array')
      done()
    })
  })

  lab.test('Create session', (done) => {
    let sessions = ShelfSessions('test-name', 'string-secret').extend({name: 'foobar'})
    sessions.createSession({
      userId: 'user',
      scopes: ['default']
    }, (err, result) => {
      Code.expect(err).to.be.null()
      Code.expect(result).to.be.an.object()
      Code.expect(result.jwt).to.be.a.string()
      Code.expect(result.userId).to.be.equal('user')
      Code.expect(result.scopes).to.be.deep.equal(['default'])
      done()
    })
  })
})
