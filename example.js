'use strict'

const ShelfSessions = require('./index')
const Crypto = require('crypto')
const Joi = require('joi')

const secret = Crypto.randomBytes(128)

let MyShelf = ShelfSessions('test', secret, {
  algorithm: 'HS256',
  subject: 'yolo',
  issuer: 'me'
})

let MyModel = MyShelf.extend({
  name: 'basic-user',
  props: {
    userAgent: Joi.string()
  }
})

MyModel.createSession({
  userId: 'me',
  scopes: ['default'],
  userAgent: 'stuff from the header'
}, (err, result) => {
  if (err) throw err
  MyModel.authenticate(result.jwt, console.log)
})
