var util = require('./util')
  , isFunc = util.isFunc
  , path = require("path")
  , fs = require("fs")
  , all = {}

function File(p) {
  this._path = p
  this._watching = false
}

File.new = function(p, fs) {
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

util.inherits(File, util.EventEmitter)

util.def(File.prototype, {
  watchStart: function() {
    if (this._watching) return
    this._watching = true
    this._watchModule.watchFile(this._path, function(current, prev) {
      this.emit("change", this)
    }.bind(this))
  }

, watchStop: function() {
    this._watchModule.unwatchFile(this._path)
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

, _watchModule: fs
})

module.exports = File
