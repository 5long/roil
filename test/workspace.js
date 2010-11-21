var reut = require("reut")
  , roil = require("../src")
  , Workspace = roil.Workspace
  , FileRoll = roil.FileRoll
  , File = roil.File
  , path = require("path")
  , EventEmitter = require("events").EventEmitter

reut.suite("Workspace Class")
.setup(function(f, done) {
  f.ws = new Workspace(__dirname)
  done()
})
.setup(function(f, done) {
  f.fakeWatcher = new EventEmitter()
  f.fakeWatcher.closure = function() {}
  done()
})
.test(".open()", function(t, f) {
  var page = f.ws.open(path.basename(__filename))
  t.typeOf(page.on, "function")
  t.emits(page, "change", function() {
    File.new(__filename).watchStop()
  })
  File.new(__filename).emit("change")
})
.test(".addServer()", function(t, f) {
  var ws = f.ws
  ws.useWatcher(f.fakeWatcher)
  ws.addServer({
    on: t.cb(function(type, fn) {
      t.equal(type, "request")
      t.equal(fn, f.fakeWatcher.closure)
    })
  })
})
.setup(function(f, done) {
  f.parent = File.new(path.join(__dirname, "/foo"))
  f.child = File.new(path.join(__dirname, "/bar"))
  done()
})
.teardown(function(f, done) {
  f.parent.watchStop()
  f.child.watchStop()
  done()
})
.test(".useWatcher()", function(t, f) {
  var ws = f.ws
    , watcher = f.fakeWatcher
    , page = ws.open("/foo")
    , parent = f.parent
    , child = f.child

  ws.useWatcher(watcher)
  page.add = t.cb(function(file) {
    t.equal(file, child)
  })

  watcher.emit("relate", {
    path: child.path
  , belongTo: parent.path
  })
})
