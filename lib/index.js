// Dependencies
import Factory from './helpers/Model'
import Storage from './helpers/Storage'
import callsite from 'callsite'
import chalk from 'chalk'

// Supported types, minus object
// object has a special check
let types = ['String', 'Boolean', 'Number', 'Any', 'Object']

function ModelGenerator (options) {
  this._storage = new Storage(options)
  this._prefix = options.prefix
}

// Throw a red error
function throwError (error) {
  throw new Error(chalk.red.bold(error))
}

ModelGenerator.prototype.extend = function (options = {}) {
  if (!this._prefix) {
    return throwError('First you need to set a prefix (good practice) before starting extending Model class')
  }

  if (!(this._storage && this._storage instanceof Storage)) {
    return throwError('Model ' + options.name + ': needs a valid storage instance')
  }

  options.prefix = this._prefix + ':' + (options.prefix || '')
  options.storage = this._storage

  // If user didnt set a name for the model
  // we will get the name of the file that called this function
  if (!options.name || typeof options.name !== 'string') {
    let stack = callsite()
    return throwError('You need to define a valid name for the model in ' + stack[1].getFileName())
  }

  if (!options.props || options.props.length <= 0) {
    return throwError('Model ' + options.name + ': must have at least one property defined')
  }

  if (!options.keys || options.keys.length <= 0) {
    return throwError('Model ' + options.name + ': must have at least one key defined')
  }

  options.strict = typeof options.strict !== 'undefined' ? options.strict : true

  // check if all properties types are supported
  for (let k in options.props) {
    if (options.props.hasOwnProperty(k)) {
      let t

      // If its a object
      // lazy check
      // TO-DO: improve this
      if (typeof options.props[k] === 'object') {
        t = 1
      } else {
        t = types.indexOf(options.props[k])
      }

      // Check if type is supported
      if (t < 0) {
        return throwError('Model ' + options.name + ': The type of the property ' + k + ' isn\'t supported -> ' + options.props[k])
      }
    }
  }

  // Keys check
  options.keys.forEach(function (key) {
    // keys can only be root properties
    if (key.indexOf('.') > 0) {
      return throwError('Model ' + options.name + ': The keys of a model can only be root properties')
    }

    if (!options.props[key]) {
      return throwError('Model ' + options.name + ': The keys of a model must be a defined property in Model.extend')
    }
  })

  return Factory(options)
}

export default ModelGenerator
