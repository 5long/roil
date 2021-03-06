var roil = require("./index.js")
  , util = require("./util")
  , socketIo = require("socket.io")
  , Client = roil.Client
  , User = roil.User
  , Workspace = roil.Workspace
  , watcher = require("./watcher")
  , path = require("path")
  , connect = require("connect")
  , staticProvider = connect.static

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
    if (this._server) throw new Error("Already attached a server")
    this._server = server
    this._attachSocket(server, options)
    this._attachStaticProvider(server, options)
  }
, _attachSocket: function(server, options) {
    this._socketListener = socketIo.listen(server, {
      log: util.noop
    , transports: ['websocket', 'htmlfile', 'xhr-multipart', 'xhr-polling']
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
      , consolePath = options.consolePath || "/roil"
      , consoleDocRoot = path.join(__dirname, "console")
      , consoleSP = staticProvider(consoleDocRoot)
    server.use(consolePath, consoleSP)
    server.use(staticProvider(documentRoot))
    this._workspace.addServer(server)
  }
, get workspace() {
    return this._workspace
  }
})

module.exports = Console
