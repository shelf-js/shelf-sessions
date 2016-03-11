# shelf-sessions

![shelf Logo](https://avatars1.githubusercontent.com/u/14891842?v=3&s=200)

Define user session model classes with ttl in redis using [jwt](https://github.com/auth0/node-jsonwebtoken) and [shelf](https://github.com/shelf-js/shelf).

[![Build Status](https://travis-ci.org/shelf-js/shelf-sessions.svg?branch=master)](https://travis-ci.org/shelf-js/shelf-sessions)
[![npm version](https://img.shields.io/npm/v/shelf-sessions.svg)](https://www.npmjs.com/package/shelf-sessions)

# Introduction

For when you need to store volatile user sessions, with all that useful info you need, but don't want to go through the pain of creating special cron jobs to clear them. Creating new sessions should be easy and authenticating requests should be fast, so, here you go, jwt + redis, perfect combo!

Shelf sessions uses [joi](https://github.com/hapijs/joi) for schema validation and [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) lib for issuing tokens and validating them.

# Example

```javascript
const ShelfSessions = require('shelf-sessions')
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
```

# API
## `ShelfSessions(name, secret, [options])`

### `.extend(model)`

## `SessionModel`

### `.deleteSession(token, callback)`

### `.createSession(session, callback)`

### `.authenticate(token, callback)`

# Contributing

We use [standard js](https://github.com/feross/standard).

In order to run the tests you should have an Redis instance running locally.

# License

MIT
