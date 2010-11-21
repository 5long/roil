var lml = require("./lml")
  , FileRoll = require("./file-roll")
  , File = require("./file")
  , path = require("path")

function Workspace(dir) {
  this._workDir = dir
  this._watchers = []
  this._pages = {}
  this._servers = []
}
lml.inherits(Workspace, lml.EventEmitter)

lml.def(Workspace.prototype, {
  open: function(relPath) {
    var page = new FileRoll()
      , absPath = path.join(this._workDir, relPath)
      , file = File.new(absPath)
    page.add(file)
    this._pages[file.path] = page
    return page
  }
, useWatcher: function(watcher) {
    watcher.on("relate", function(e) {
      var parent = this._pages[e.belongTo]
      if (parent) parent.add(File.new(e.path))
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
