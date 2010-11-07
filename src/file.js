var lml = require('./lml')
  , fs = require('fs')
  , path = require("path")
  , all = {}

function File(p) {
  this._path = p
  this._watching = false
}

File.new = function(p) {
  p = File.normalizePath(p)
  return p in all ? all[p] : all[p] = new File(p)
}

File.normalizePath = function(p) {
  p = File.absolutePath.test(p)
    ? p
    : path.join(process.cwd(), p)
  p = path.normalize(p)
  return p
}

File.absolutePath = /^\//

lml.inherits(File, lml.EventEmitter)

lml.def(File.prototype, {
  watchStart: function() {
    if (this._watching) return
    this._watching = true
    fs.watchFile(this._path, function(current, prev) {
      this.emit("change", current, prev)
    }.bind(this))
  }

, watchStop: function() {
    fs.unwatchFile(this._path)
    this._watching = false
  }

, toString: function() {
    return this._path
  }

, get watching() {
    return this._watching
  }

, get path() {
    return this._path
  }
})

module.exports = File
