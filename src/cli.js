#!/usr/bin/env node
var Console = require("./console")
  , arg, options = {
      workDir: process.cwd()
    , consolePath: "/roil/"
    , port : 3000
    }
  , args = process.argv.slice(2)
  , connect = require("connect")
  , server = connect.createServer()
  , c = new Console()

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
    defaut:
      throw new Error("Unknown argument: " + arg)
  }
}

c.attach(server, options)
server.listen(options.port)

if (options.debug) {
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
