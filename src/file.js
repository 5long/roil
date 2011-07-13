var util = require('./util')
  , path = require("path")
  , fs = require("fs")
  , all = {}
  , AbstractResource = require("./abstract_resource")

function File(p) {
  AbstractResource.call(this)
  this._path = p
}

File.instances = all
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

util.inherits(File, AbstractResource)

util.def(File.prototype, {
  watchStart: function() {
    if (this._watching) return
    AbstractResource.prototype.watchStart.call(this)
    this._watchModule.watchFile(this._path, function(current, prev) {
      this.emit("change", this)
    }.bind(this))
  }

, watchStop: function() {
    this._watchModule.unwatchFile(this._path)
    AbstractResource.prototype.watchStop.call(this)
  }

, toString: function() {
    return this._path
  }

, get path() {
    return this._path
  }

, _watchModule: fs
})

module.exports = File
