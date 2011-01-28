var roil = require("./index.js")
  , util = require("./util")
  , socketIo = require("socket.io")
  , Client = roil.Client
  , User = roil.User
  , Workspace = roil.Workspace
  , watcher = require("./watcher")
  , path = require("path")
  , connect = require("connect")
  , staticProvider = connect.staticProvider

function Console(workDir, workspace) {
  this._workDir = workDir || process.cwd()
  this._workspace = workspace || new Workspace()
  this._users = []
  this._prepareWorkspace(this._workspace)
}
util.def(Console.prototype, {
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
    var documentRoot = options.workDir || process.cwd()
      , consolePath = options.consolePath || "/roil/"
      , consoleDocRoot = path.join(__dirname, "console")
      , consoleSP = staticProvider(consoleDocRoot)
      , leadingPath = new RegExp(consolePath + "(.*)$")
    server.use(connect.router(function(app) {
      app.get(leadingPath, function(req, res, next) {
        var trailingPath = req.params[0]
        if (trailingPath.charAt(0) != "/") {
          trailingPath = "/" + trailingPath
        }
        req.url = trailingPath
        consoleSP.call(this, req, res, next)
      })
    }))
    server.use(staticProvider(documentRoot))
    this._workspace.addServer(server)
  }
})

module.exports = Console
