var util = require("./util")
  , connect = require("connect")
  , File = require("./file")
  , WebResource = require("./resource")

function RoilApp(conf) {
  this._conf = conf
  this.server = connect.createServer()
  this._resourceRules = []
  this._resources = {}
}

util.def(RoilApp.prototype, {
  run: function() {
    this.server.listen(this._conf.port)
  }
, shutdown: function() {
    this.server.close()
  }
, loadPlugin: function(plugin) {
    plugin.call(null, this)
  }
, addResource: function(r) {
    if (r in this._resources) return
    this._resources[r] = r
    this._resourceRules.forEach(function(rule) {
      if (!(r instanceof rule.klass)) return
      (rule.cb)(r)
    })
  }
, matchResource: function(klass) {
    var cb = arguments[arguments.length - 1]
      , newRule = {
          klass: klass
        , cb: cb
        }
    this._resourceRules.push(newRule)
    for (var i in this._resources) {
      var r = this._resources[i]
      if (!(r instanceof newRule.klass)) continue
      cb(r)
    }
  }
, resource: {
    File: File
  , WebResource: WebResource
  }
})

module.exports = RoilApp
