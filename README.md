# Deprecated
Please note that this project **is not actively maintained anymore**

# shelf-sessions

![shelf Logo](https://avatars1.githubusercontent.com/u/14891842?v=3&s=200)

Define user session model classes with ttl in redis using [jwt](https://github.com/auth0/node-jsonwebtoken) and [shelf](https://github.com/shelf-js/shelf).

[![Build Status](https://travis-ci.org/shelf-js/shelf-sessions.svg?branch=master)](https://travis-ci.org/shelf-js/shelf-sessions)
[![npm version](https://img.shields.io/npm/v/shelf-jwt-sessions.svg)](https://www.npmjs.com/package/shelf-jwt-sessions)

# Introduction

For when you need to store volatile user sessions, with all that useful info you need, but don't want to go through the pain of creating special cron jobs to clear them. Creating new sessions should be easy and authenticating requests should be fast, so, here you go, jwt + redis, perfect combo!

Shelf sessions uses [joi](https://github.com/hapijs/joi) for schema validation and [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) lib for issuing tokens and validating them.

# Example

```javascript
const ShelfSessions = require('shelf-jwt-sessions')
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
## `ShelfSessions(name, secretOrPrivateKey, [options])`
Initiate a ShelfSessions instance.
- `name` will be the name used to instantiate [Shelf](https://github.com/shelf-js/shelf)
- `secretOrPrivateKey` secret/private key used to sign the JWT's as described by the [node-jsonwebtoken library](https://github.com/auth0/node-jsonwebtoken). **It must be a string or a buffer**.
- `[options]` series of optional parameters used by [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) and [Shelf](https://github.com/shelf-js/shelf)
    - `[algorithm]` algorithm used to sign the jwt
    - `[audience]` audience claim
    - `[subject]` subject claim
    - `[issuer]` issuer claim
    - `[headers]` additional headers as specified by [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
    - `[ttl]` sessions ttl in seconds. **Defaults to 72 hours**
    - `[shelf]` an already inited shelf instance (will override connection options to instantiate Shelf)
    - `[host]` redis host used by Shelf
    - `[port]` redis port used by Shelf
    - `[password]` redis password used by Shelf
    - `[defaultProps]` an optional json object whose keys should be [Joi](https://github.com/hapijs/joi) objects. This is used to extend the default session schema and be used on all the `.extend()` calls. The default schema will be:
    ```
    {
      jwt: Joi.string().required(),
      userId: Joi.string().required(),
      scopes: Joi.array().min(1).required()
    }
    ```
    You can extend the schema at will but **this three keys must always exist**.

### `.extend(model)`
Generate a [SessionModel]() schema similar to what you would do with a regular [Shelf instance](https://github.com/shelf-js/shelf). The provided schema will then be used to operate on the specified models.
- `model` a model similar to what you would use in `Shelf.extend(model)`
    - `name` a mandatory name for the schema.
    - `[props]` an optional json object whose keys should be [Joi](https://github.com/hapijs/joi) objects, used to extend the base user model according to the `defaultProps`.

    ** Note: ** no keys array is provided to act as Redis key, as it will always be the `jwt`.

## `SessionModel`
The result of the `.extend()` call. This will allow to make operations based on the schemas and options previously provided.

### `.deleteSession(token, callback)`
Delete the sessions associated with the `token`. The `callback` will be called with an error in case of failure.
- `token` jwt token
- `callback` a callback function

### `.createSession(session, callback)`
Creates a session based on the given `session` object. The callback will be called as - `callback(error, resultSession)` - being that, if successful, the provided `resultSession` will be a Shelf Model with all the normal operations associated to it.
- `session` a session json object
- `callback` a callback function

### `.authenticate(token, callback)`
Given a jwt, this method verifies it and returns the correspondent `session` Shelf Model stored in Redis. The callback will be called as - `callback(error, resultSession)`
- `token` jwt token
- `callback` a callback function

# Contributing

We use [standard js](https://github.com/feross/standard).

In order to run the tests you should have an Redis instance running locally.

# License

MIT
