var lml = require("./lml")
  , Resource = require("./resource")
  , File = require("./file")
  , path = require("path")

function Workspace() {
  this._watchers = []
  this._resources = {}
  this._servers = []
}
lml.inherits(Workspace, lml.EventEmitter)

lml.def(Workspace.prototype, {
  open: function(relPath) {
    var resource = Resource.new(relPath)
    this._resources[resource] = resource
    return resource
  }
, useWatcher: function(watcher) {
    watcher.on("relate", function(e) {
      var parent = this._resources[e.belongTo]
      if (parent) parent.add(e.resource)
    }.bind(this))
    this._servers.forEach(function(server) {
      server.on("request", watcher.closure)
    })
    this._watchers.push(watcher)
  }
, addServer: function(server) {
    this._watchers.forEach(function(watcher) {
      server.on("request", watcher.closure)
    })
    this._servers.push(server)
  }
})

module.exports = Workspace
