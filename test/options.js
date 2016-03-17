'use strict'

const Lab = require('lab')
const Code = require('code')
const proxyquire = require('proxyquire')
const lab = exports.lab = Lab.script()
const Joi = require('joi')
const extend = require('lodash.assign')

// Use stubs for shelf and sessionModel to see if expected options
// are going through

lab.experiment('Shelf sessions - options', () => {
  lab.test('Passing shelf options', (done) => {
    const shelfOpts = {
      host: 'test.foo.bar',
      port: 3000,
      auth_pass: 'special_password'
    }
    const ShelfSessions = proxyquire('../lib/index.js', {shelf: function (name, options) {
      Code.expect(name).to.be.equal('test-name')
      Code.expect(options).to.be.an.object()
      Code.expect(options).to.deep.equal(shelfOpts)
      done()
    }})
    ShelfSessions('test-name', 'string-secret', {
      host: shelfOpts.host,
      port: shelfOpts.port,
      password: shelfOpts.auth_pass
    })
  })

  lab.test('Passing session model options', (done) => {
    const mockModel = {
      props: {
        a: Joi.string()
      },
      keys: ['shoul-be-overriden'],
      name: 'foobar'
    }
    const sessionOptions = {}
    sessionOptions.jwt = {
      algorithm: 'alg-test',
      audience: 'aud-test',
      subject: 'subj-test',
      issuer: 'issuer-test',
      headers: 'headers-test',
      expiresIn: 10000
    }
    // Provide with an already inited instance of shelf
    sessionOptions.shelf = {test: 'shelf'}
    sessionOptions.secret = '123'

    const ShelfSessions = proxyquire('../lib/index.js',
      {'./helpers/SessionModel': function (shelf, model, options) {
        Code.expect(shelf).to.be.deep.equal(sessionOptions.shelf)
        Code.expect(model).to.be.an.object()
        Code.expect(options).to.be.an.object()
        Code.expect(model.props.isJoi).to.be.true()
        Code.expect(model.props._inner.children).to.deep.include({key: 'a'})
        Code.expect(model.keys).to.be.deep.equal(['jwt'])
        Code.expect(model.name).to.be.equal(mockModel.name)
        done()
      }
    })
    let options = extend({
      ttl: sessionOptions.jwt.expiresIn,
      shelf: {test: 'shelf'},
      secret: sessionOptions.secret
    }, sessionOptions.jwt)
    let sessions = ShelfSessions('test-name', 'string-secret', options)
    sessions.extend(mockModel)
  })
})
