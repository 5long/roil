var util = require("../util")
  , Resource = require("../resource")
  , EventEmitter = require("events").EventEmitter
  , path = require("path")
  , url = require("url")

function RefererWatcher() {}
util.inherits(RefererWatcher, EventEmitter)

util.def(RefererWatcher.prototype, {
  get closure() {
    this._closure = this._closure || function(request, response) {
      if (!("referer" in request.headers)) return
      var served = { resource: Resource.new(request.url) }
        , referer = url.parse(request.headers.referer).pathname
      served.belongTo = Resource.new(referer)
      this.emit("relate", served)
    }.bind(this)
    return this._closure
  }
})

module.exports = RefererWatcher
