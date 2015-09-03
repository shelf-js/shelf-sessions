import ProtoModel from './ProtoModel'

function Model (options) {
  /**
   * Constructor
   * @type {Prototype}
   */
  let Proto = ProtoModel(options)

  /**
  * Save the newly created Channel object
  *
  * @param {Function} callback
  * @access public
  * @returns {undefined}
  */
  Proto.prototype.save = function (callback) {
    let key = Proto.key(this)
    Proto.storage.client().set(key, JSON.stringify(this), callback)
  }

  // Important functions
  Proto.storage = options.storage
  Proto.key = ProtoModel.generateKeyFunc(options.prefix, options.name, options.keys)

  /**
  * Get one specific object
  *
  * @param {number|string} channelId
  * @param {Channel~callback} callback
  * @access public
  * @returns {undefined}
  */
  Proto.get = function (keyObj, callback) {
    let key = Proto.key(keyObj)
    Proto.storage.client().get(key, function (err, propsJson) {
      if (err) {
        return callback(new Error('Error loading channel: ' + err))
      }
      // If empty return empty callback
      if (!propsJson) {
        return callback()
      }

      let properties = JSON.parse(propsJson)

      // Force strict and enforce to false
      let channel = new Proto(properties, {strict: false, enforce: false})

      return callback(null, channel)
    })
  }

  /*
  * Get multiple objects
  * @param {[type]}   key [description]
  * @param {Function} cb  [description]
  */
  Proto.mget = function (keyObj, cb) {
    let key = Proto.key(keyObj)
    Proto.storage.client().keys(key, function (err, keys) {
      if (err || keys.length < 1) {
        return cb(err, [])
      }

      Proto.storage.client().mget(keys, function (err, subscriptions) {
        if (err) {
          return cb(err)
        }

        for (let s in subscriptions) {
          if (subscriptions.hasOwnProperty(s)) {
            // Force strict and enforce to false
            subscriptions[s] = new Proto(JSON.parse(subscriptions[s]), {strict: false, enforce: false})
          }
        }

        return cb(null, subscriptions)
      })
    })
  }

  /**
  * Delete channel from Redis
  *
  * @param {number|string} channelId
  * @param {Channel~callback} callback
  * @access public
  * @returns {undefined}
  */
  Proto.del = function (keyObj, callback) {
    let key = Proto.key(keyObj)
    Proto.storage.client().del(key, callback)
  }

  /**
  * Delete channel from Redis (prototype version)
  *
  * @param {Channel~callback} callback
  * @access public
  * @returns {undefined}
  */
  Proto.prototype.del = function (callback) {
    let key = Proto.key(this)
    Proto.storage.client().del(key, callback)
  }

  return Proto
}

export default Model
