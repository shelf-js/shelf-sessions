'use strict'

const Lab = require('lab')
const Code = require('code')
const proxyquire = require('proxyquire')
const lab = exports.lab = Lab.script()
const SessionModel = require('../../lib/helpers/SessionModel')

lab.experiment('Session model - init', () => {
  lab.test('No shelf instance provided to session model', (done) => {
    Code.expect(
      () => SessionModel()
    ).to.throw(Error, 'Uninitialized shelf. Unable to create session model.')
    done()
  })

  lab.test('Correctly handles error from saveWithTTL', (done) => {
    let mockShelf = {
      extend: () => {
        return () => {
          return {saveWithTTL: (model, cb) => cb(new Error('This is a mock error'))}
        }
      }
    }
    let model = SessionModel(mockShelf, {}, {secret: '123', jwt: {expiredIn: 100}})
    model.createSession({
      userId: 'user',
      scopes: ['default']
    }, (err) => {
      Code.expect(err).not.to.be.null()
      Code.expect(err).to.be.instanceof(Error)
      Code.expect(err.message).to.be.equal('This is a mock error')
      done()
    })
  })

  lab.test('Correctly handles error from shelf model get', (done) => {
    let mockShelf = {
      extend: () => {
        return {get: (keys, cb) => cb(new Error('This is a mock error'))}
      }
    }
    let model = SessionModel(mockShelf, {}, {secret: '123', jwt: {expiredIn: 100}})
    model.authenticate('test-token', (err) => {
      Code.expect(err).not.to.be.null()
      Code.expect(err).to.be.instanceof(Error)
      Code.expect(err.message).to.be.equal('This is a mock error')
      done()
    })
  })

  lab.test('Correctly handles error from jwt verify', (done) => {
    const SessionModelStub = proxyquire('../../lib/helpers/SessionModel',
      {
        jsonwebtoken: {
          verify: (_, __, ___, cb) => cb(new Error('This is a mock error'))
        }
      }
    )
    let mockShelf = {
      extend: () => {
        return {get: (keys, cb) => cb(null, {jwt: 'test-token'})}
      }
    }
    let model = SessionModelStub(mockShelf, {}, {secret: '123', jwt: {expiredIn: 100}})
    model.authenticate('test-token', (err) => {
      Code.expect(err).not.to.be.null()
      Code.expect(err).to.be.instanceof(Error)
      Code.expect(err.message).to.be.equal('This is a mock error')
      done()
    })
  })
})
