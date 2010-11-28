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
    this._resources[relPath] = this._resources[relPath]
      || Resource.new(relPath)
    return this._resources[relPath]
  }
, useWatcher: function(watcher) {
    watcher.on("relate", function(e) {
      var parent, url = e.belongTo.url
      this._resources[url] = this._resources[url] || e.belongTo
      parent = this._resources[url]
      parent.add(e.resource)
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
