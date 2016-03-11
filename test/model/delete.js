'use strict'

const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const ShelfSessions = require('../../index')

lab.experiment('Session model - delete', () => {
  lab.test('Delete session', (done) => {
    let sessions = ShelfSessions('test-name', 'string-secret').extend({name: 'foobar'})
    sessions.deleteSession('abc', (err) => {
      Code.expect(err).to.be.null()
      done()
    })
  })
})
