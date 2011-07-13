var util = require("./util")
  , connect = require("connect")
  , File = require("./file")
  , WebResource = require("./resource")

function RoilApp(conf) {
  this._conf = conf
  this.server = connect.createServer()
  this._resourceRules = []
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
    this._resourceRules.forEach(function(rule) {
      if (!(r instanceof rule.klass)) return
      (rule.cb)(r)
    })
  }
, matchResource: function(klass, cb) {
    var newRule = {
      klass: klass
    , cb: cb
    }
    this._resourceRules.push(newRule)
    for (var i in klass.instances) {
      cb(klass.instances[i])
    }
  }
, resource: {
    File: File
  , WebResource: WebResource
  }
})

module.exports = RoilApp
