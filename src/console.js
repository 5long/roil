var roil = require("./index.js")
  , lml = require("./lml")
  , socketIo = require("socket.io")
  , Client = roil.Client
  , User = roil.User
  , Workspace = roil.Workspace
  , watcher = require("./watcher")
  , path = require("path")
  , staticProvider = require("./static-provider")

function Console(workDir, workspace) {
  this._workDir = workDir || process.cwd()
  this._workspace = workspace || new Workspace()
  this._users = []
  this._prepareWorkspace(this._workspace)
}
lml.def(Console.prototype, {
  _prepareWorkspace: function(ws) {
    ws.useWatcher(new watcher.Referer())
    ws.useWatcher(new watcher.Static(this._workDir))
  }
, attach: function(server, options) {
    if (this._server) throw Error("Already attached a server")
    this._server = server
    this._attachSocket(server, options)
    this._attachStaticProvider(server, options)
  }
, _attachSocket: function(server, options) {
    this._socketListener = socketIo.listen(server, {
      log: new Function()
    })
    this._socketListener.on("connection", function(socket) {
      var user = new User(new Client(socket))
      this._users.push(user)
      user.use(this._workspace)
    }.bind(this))
  }
, _attachStaticProvider: function(server, options) {
    options = options || {}
    var workingOpt = {
          root: options.workDir || process.cwd()
        }
      , consoleOpt = {
          pathHead: options.consolePath || "/roil"
        , root: path.join(__dirname, "console")
        }
    if (server.use) {
      server.use(staticProvider(consoleOpt))
      server.use(staticProvider(workingOpt))
    }
    else {
      server.on("request", staticProvider(consoleOpt))
      server.on("request", staticProvider(workingOpt))
    }
    this._workspace.addServer(server)
  }
})

module.exports = Console
