// Dependency
import chalk from 'chalk'

/**
 * Defines the Model for the given options
 *
 */

function Model (extendOptions) {
  let name = extendOptions.name
  let props = extendOptions.props
  let required = extendOptions.keys

  let throwErrorInternal = _throwError.bind({name: extendOptions.name})

  if (typeof extendOptions.required === 'object') {
    extendOptions.required.forEach(function (key) {
      if (required.indexOf(key) < 0) {
        required.push(key)
      }
    })
  }

  let recursiveValidation = function (opt, properties, obj) {
    let propertiesObject = {}

    let strict = obj.strict
    // Enforce validation
    // only valid if strict is false
    let enforce = obj.enforce

    for (let prop in opt) {
      if (opt.hasOwnProperty(prop)) {
        // Is it a object ?
        if (typeof properties[prop] === 'object') {
          // Just to be sure we dont
          // break anything
          if (typeof opt[prop] === 'object') {
            // call self
            propertiesObject[prop] = recursiveValidation(opt[prop], properties[prop], obj)
            continue
          } else {
            return throwErrorInternal('The property ' + prop + ' must be an object')
          }
        }

        if (strict) {
          if (typeof properties[prop] === 'undefined') {
            return throwErrorInternal('The strict mode is on, so you can only construct the model with properties defined')
          }

          // Type validation
          if (properties[prop] !== 'any' && properties[prop] !== typeof opt[prop]) {
            // This function can throw an error
            // or send the value converted
            opt[prop] = _typeValidation(properties[prop], opt[prop], prop, throwErrorInternal)
          }
        } else {
          // Strict mode is off
          // so we only check the type
          // of the properties defined
          // on extend
          if (typeof properties[prop] !== 'undefined') {
            if (enforce) {
              // Type validation
              if (properties[prop] !== 'any' && properties[prop] !== typeof opt[prop]) {
                // This function can throw an error
                // or send the value converted
                opt[prop] = _typeValidation(properties[prop], opt[prop], prop, throwErrorInternal)
              }
            }
          }
        }

        // Add it!
        propertiesObject[prop] = opt[prop]
      }
    }

    return propertiesObject
  }

  let recursiveObjRequired = (array, obj) => {
    let result = false

    array.forEach((reqObj, i) => {
      if (i + 1 !== array.length && obj[reqObj]) {
        obj = obj[reqObj]
      } else if (obj[reqObj]) {
        result = true
      }
    })

    return result
  }

  return (properties = {}, options = {}) => {
    let reqList = required.slice()
    let strict = typeof options.strict !== 'undefined' ? options.strict
                 : typeof extendOptions.strict !== 'undefined' ? extendOptions.strict
                 : true
    let enforce = typeof options.enforce !== 'undefined' ? options.enforce
                 : true
    let err

    // Store hidden options inside this instance
    Object.defineProperty(this, '__settings__', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: {
        strict: strict,
        enforce: enforce
      }
    })

    // Recursive construction and validation of the object
    properties = recursiveValidation(properties, props, {strict: strict, enforce: enforce})

    reqList = reqList.filter((req) => {
      // Is the requred property an
      // object ?
      if (req.indexOf('.') > 0) {
        let reqArray = req.split('.')

        if (recursiveObjRequired(reqArray, properties)) {
          return false
        }
      } else if (properties[req]) {
        return false
      }

      return true
    })

    // More detailed error message
    // for required properties
    if (reqList.length > 0) {
      err = 'Model ' + name + ': '
      if (reqList.length === 1) {
        err += 'The property ' + reqList[0] + ' is required'
      } else {
        err += 'The following properties are required -> '

        reqList.forEach(function (p) {
          err += p + ', '
        })
        err = err.substr(0, err.length - 2)
      }
    }

    // Error throw
    if (err) {
      throw new Error(chalk.red.bold(err))
    }

    // Passing attributes to this
    // object
    for (let prop in properties) {
      if (properties.hasOwnProperty(prop)) {
        this[prop] = properties[prop]
      }
    }
  }
}

Model.generateKeyFunc = (prefix, name, keys) => function (obj) {
  if (!obj) {
    return _throwError('When using methods, the object keys must be set with all the model keys')
  }

  let k = prefix + ':' + name + ':'
  keys.forEach(key => {
    if (obj[key]) {
      k += obj[key] + ':'
    } else {
      return _throwError('Missing the key ' + key + ' from the keys object')
    }
  })

  return k.slice(0, -1)
}

// Export the model
export default Model

// ----- Helper functions ----- //

// Throw a cool red error
function _throwError (error) {
  throw new Error(chalk.red.bold('Model ' + this.name + ': ' + error))
}

function _typeValidation (type, value, propertyName, throwFn) {
  // Exceptions must be
  // put here in this handle
  if (type === 'number' && typeof value === 'string') {
    let len = value.length

    if (len === parseFloat(value).toString().length) {
      return parseFloat(value)
    }
  }

  if (type === 'string' && typeof value === 'number') {
    return value.toString()
  }

  return throwFn('The property ' + propertyName + ' must be a ' + type)
}
