// Dependencies
import Shelf from 'shelf'

function ShelfSessions (name, model, options) {
  this._shelf = new Shelf(name)
  this._model = this._shelf.extend(model)
  this.ttl = options.ttl || 24 * 60 * 60
}

ShelfSessions.prototype.saveSession = function (model, options, cb = options) {
  options = typeof options === 'function' ? {} : options
}
