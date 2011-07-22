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
    if (this._conf.debug) console.log("ADD", r.path)
    this._resources[r] = r
    this._resourceRules.forEach(function(rule) {
      RoilApp._applyRule(rule, r)
    }, this)
  }
, matchResource: function(klass) {
    var cb = arguments[arguments.length - 1]
      , newRule = {
          klass: klass
        , cb: cb
        }
    this._resourceRules.push(newRule)
    for (var i in this._resources) {
      RoilApp._applyRule(newRule, this._resources[i])
    }
  }
, resource: {
    File: File
  , WebResource: WebResource
  }
, attachWorkspace: function(ws) {
    ws.on("BC:resource", function(r) {
      this.addResource(r)
    }.bind(this))
  }
})

RoilApp._applyRule = function(rule, resource) {
  if (!(resource instanceof rule.klass)) return
  (rule.cb)(resource)
}

module.exports = RoilApp
