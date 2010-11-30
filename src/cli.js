#!/usr/bin/env node
var Console = require("./console")
  , arg, options = {
      workDir: process.cwd()
    , consolePath: "/roil/"
    , port: 8913
    , debug: false
    }
  , args = process.argv.slice(2)
  , connect = require("connect")
  , server = connect.createServer()
  , c = new Console()
  , helpMessage =
    [ "Usage: roil [options]"
    , "Options:"
    , "  -v, --version"
    , "    print version and exit"
    , ""
    , "  -p <port>, --port <port>"
    , "    port to listen, 8913 by default"
    , ""
    , "  -d <path>, --work-dir <path>"
    , "    document root for this HTTP server, cwd is used by default"
    , ""
    , "  -c <path>, --console-path <path>"
    , "    use a specific path for console, `/roil/' by default"
    , "    mostly you don't have to worry 'cuz \"roil\" is a strange name"
    , ""
    , "  -h, --help"
    , "    print this and exit"
    ].join("\n")

while (arg = args.shift()) {
  switch (arg) {
    case "-d":
    case "--work-dir":
      options.workDir = args.shift()
      break;
    case "-p":
    case "--port":
      options.port = parseInt(args.shift(), 10)
      break;
    case "-c":
    case "--console-path":
      options.consolePath = args.shift()
      break;
    case "--debug":
      options.debug = true
      break;
    case "-v":
    case "--version":
      console.log("roil v0.1.0")
      process.exit()
    case "-h":
    case "--help":
      console.log(helpMessage)
      process.exit(1)
    default:
      throw new Error("Unknown argument: " + arg)
  }
}

c.attach(server, options)
server.listen(options.port)

console.log(
  "Roil server started on http://localhost:"
+ options.port
+ options.consolePath
)
console.log(
  "Document root is"
, options.workDir
)

if (options.debug) {
  console.log(options)
  var context = require("repl").start().context
  context.c = c
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
