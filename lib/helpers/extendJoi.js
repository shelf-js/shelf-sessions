'use strict'

function extendJoi (defaultModel, newModel) {
  // Extend Joi objects only works like this
  if (newModel && Object.keys(newModel).length > 0) {
    return defaultModel.keys(newModel)
  }
  return defaultModel
}

module.exports = extendJoi
