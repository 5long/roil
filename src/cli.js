#!/usr/bin/env node
var Console = require("./console")
  , RoilApp = require("./app")
  , arg, options = {
      workDir: process.cwd()
    , consolePath: "/roil/"
    , port: 8913
    , debug: false
    , browserBins: []
    }
  , args = process.argv.slice(2)
  , fs = require("fs")
  , path = require("path")
  , exec = require("child_process").exec
  , connect = require("connect")
  , server = connect.createServer()
  , c = new Console()
  , plugIns = []
  , helpMessage =
    [ "Usage: roil [options]"
    , "Options:"
    , "  -v, --version"
    , "    print version and exit"
    , ""
    , "  -p <port>, --port <port>"
    , "    port to listen, 8913 by default"
    , ""
    , "  -b <bin>, --launch-browser <bin>"
    , "    launch browser(s) to open console path"
    , ""
    , "  -d <path>, --work-dir <path>"
    , "    document root for this HTTP server, cwd is used by default"
    , ""
    , "  -c <path>, --console-path <path>"
    , "    use a specific path for console, `/roil/' by default"
    , "    mostly you don't have to worry 'cuz \"roil\" is a strange name"
    , ""
    , "  -l <file>, --load-plugin <file>"
    , "    load <file> as roil plugin"
    , ""
    , "  --debug"
    , "    You don't have to know"
    , ""
    , "  -h, --help"
    , "    print this and exit"
    ].join("\n")

while (arg = args.shift()) {
  switch (arg) {
    case "-d":
    case "--work-dir":
      options.workDir = args.shift()
      break
    case "-p":
    case "--port":
      options.port = parseInt(args.shift(), 10)
      break
    case "-c":
    case "--console-path":
      options.consolePath = args.shift()
      break
    case "-b":
    case "--launch-browser":
      options.browserBins.push(args.shift())
      break
    case "--debug":
      options.debug = true
      break
    case "-v":
    case "--version":
      var version = JSON.parse(
            fs.readFileSync(
              path.join(__dirname, "../package.json")
            )
          ).version
      console.log(version)
      process.exit()
    case "-h":
    case "--help":
      console.log(helpMessage)
      process.exit(1)
    case "-l":
    case "--load-plugin":
      plugIns.push(args.shift())
      break
    default:
      console.log("Unknown argument:", arg)
      process.exit(1)
  }
}

c.attach(server, options)
var app = new RoilApp(options)
app.server = server
app.attachWorkspace(c.workspace)
plugIns.forEach(function(p) {
  p = path.resolve(p)
  app.loadPlugin(require(p))
})
server.listen(options.port)

var consolePath = "http://localhost:" + options.port + options.consolePath

options.browserBins.forEach(function(bin) {
  exec(bin + " " + consolePath, function(err) {
    if (err) console.error(err.message)
  })
})

console.log(
  "Roil server started on"
, consolePath
)
console.log(
  "Document root is"
, options.workDir
)

if (options.debug) {
  console.log(options)
  var context = require("repl").start().context
  context.c = c
  context.a = app
  context.s = server
  c._socketListener.on("connection", function(client) {
    client.on("message", function(msg) {
      console.log(msg)
    })
  })
  process.on("uncaughtException", function(e) {
    console.log(e.stack || e.message)
  })
}
