'use strict'

const Lab = require('lab')
const Code = require('code')
const Crypto = require('crypto')
const lab = exports.lab = Lab.script()
const ShelfSessions = require('../index')

const secret = Crypto.randomBytes(128)

lab.experiment('Shelf sessions - init', () => {
  lab.test('No name', (done) => {
    let sessions = ShelfSessions(null, 'string-secret')
    Code.expect(
      () => sessions.extend()
    ).to.throw(Error)

    done()
  })

  lab.test('No secret', (done) => {
    Code.expect(
      () => ShelfSessions('test-name', null)
    ).to.throw(Error, 'You need to define a valid secret')

    done()
  })

  lab.test('Invalid secret', (done) => {
    Code.expect(
      () => ShelfSessions('test-name', 123)
    ).to.throw(Error, 'You need to define a valid secret')

    done()
  })

  lab.test('valid buffer secret', (done) => {
    Code.expect(
      () => ShelfSessions('test-name', secret)
    ).not.to.throw()

    done()
  })

  lab.test('Valid string secret', (done) => {
    Code.expect(
      () => ShelfSessions('test-name', 'string-secret')
    ).not.to.throw()

    done()
  })

  lab.test('No name for model', (done) => {
    let sessions = ShelfSessions('test-name', 'string-secret')
    Code.expect(
      () => sessions.extend()
    ).to.throw(Error)

    done()
  })

  lab.test('Extend model', (done) => {
    let sessions = ShelfSessions('test-name', 'string-secret')
    Code.expect(
      () => sessions.extend({name: 'foobar'})
    ).not.to.throw()

    done()
  })
})
