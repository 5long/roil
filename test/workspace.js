var reut = require("reut")
  , roil = require("../src")
  , Workspace = roil.Workspace
  , Resource = roil.Resource
  , File = roil.File
  , path = require("path")
  , EventEmitter = require("events").EventEmitter

reut.suite("Workspace Class")
.setup(function(f, done) {
  f.ws = new Workspace()
  f.path = "/" + path.basename(__filename)
  done()
})
.setup(function(f, done) {
  f.fakeWatcher = new EventEmitter()
  f.fakeWatcher.closure = function() {}
  done()
})
.test(".open()", function(t, f) {
  var page = f.ws.open(f.path)
  t.typeOf(page.on, "function")
  t.equal(page, Resource.new(f.path))
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
  f.parent = Resource.new("/baz")
  f.child = Resource.new("/bar")
  done()
})
.teardown(function(f) {
  Resource.instances = {}
})
.test(".useWatcher()", function(t, f) {
  var ws = f.ws
    , watcher = f.fakeWatcher
    , page = ws.open("/baz")
    , parent = f.parent
    , child = f.child
    , count = 0

  ws.useWatcher(watcher)
  page.add = t.cb(function(file) {
    t.equal(file, child)
  })
  t.emits(ws, 'BC:resource', function(r) {
    t.ok(r == parent || r == child)
    count++
  })

  watcher.emit("relate", {
    resource: child
  , belongTo: parent
  })
  t.is(count, 2)
})
