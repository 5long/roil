var lml = require("../lml")
  , Resource = require("../resource")
  , File = require("../file")
  , EventEmitter = require("events").EventEmitter
  , path = require("path")

function StaticWatcher(baseDir) {
  this._baseDir = baseDir
}
lml.inherits(StaticWatcher, EventEmitter)

lml.def(StaticWatcher.prototype, {
  get closure() {
    this._closure = this._closure || function(request, response) {
      var absPath = path.join(this._baseDir, request.url)
        , served = { resource: File.new(absPath) }
      served.belongTo = Resource.new(request.url)
      this.emit("relate", served)
    }.bind(this)
    return this._closure
  }
})

module.exports = StaticWatcher
