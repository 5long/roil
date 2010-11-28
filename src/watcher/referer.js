var lml = require("../lml")
  , EventEmitter = require("events").EventEmitter
  , path = require("path")
  , url = require("url")

function RefererWatcher(baseDir) {
  this._baseDir = baseDir
}
lml.inherits(RefererWatcher, EventEmitter)

lml.def(RefererWatcher.prototype, {
  get closure() {
    this._closure = this._closure || function(request, response) {
      var served = { path: path.join(this._baseDir, request.url) }
      if ("referer" in request.headers) {
        var relPath = url.parse(request.headers.referer).pathname
        served.belongTo = path.join(this._baseDir, relPath)
      }
      this.emit("relate", served)
    }.bind(this)
    return this._closure
  }
})

module.exports = RefererWatcher