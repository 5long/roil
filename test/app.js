var reut = require("reut")
  , RoilApp = require("../src/app")
  , WebResource = require("../src/resource")
  , EventEmitter = require("events").EventEmitter

reut.suite("App class")
.setup(setupApp)
.teardown(function(f) {
  WebResource.instances = {}
})
.test("run and shutdown methods", function(t, f) {
  var app = f.app
    , server = app.server
  app.run()
  t.ok(server)
  t.typeOf(server.use, 'function')
  app.shutdown()
})
.test("loadPlugin", function(t, f) {
  var app = f.app
    , dummyPlugin = t.called(function(roil) {
        t.is(roil, app)
      })
  app.loadPlugin(dummyPlugin)
})
.test("addResource then matchResource", function(t, f) {
  var app = f.app
    , someResource = WebResource.new('/foo/bar')
  app.addResource(someResource)
  app.matchResource(WebResource, t.cb(function(r) {
    t.is(r, someResource)
  }))
})
.test("matchResource then addResource", function(t, f) {
  var app = f.app
    , anotherRes
  app.matchResource(WebResource, t.cb(function(r) {
    t.is(r, anotherRes)
  }))
  anotherRes = WebResource.new("/holy/crap")
  app.addResource(anotherRes)
})
.test("Exposing resource classes", function(t, f) {
  var r = f.app.resource
  t.typeOf(r.File, 'function')
  t.typeOf(r.WebResource, 'function')
})
.test("addResource more than once", function(t, f) {
  var app = f.app
    , r = app.resource
    , someResource = WebResource.new('/foo/bar')
    , count = 0
  app.matchResource(r.WebResource, function(r) {
    count++
  })
  app.addResource(someResource)
  app.addResource(someResource)
  app.addResource(someResource)
  t.is(count, 1)
})
.test("attachWorkspace()", function(t, f) {
  var app = f.app
    , ws = new EventEmitter
    , blah = {}
  app.addResource = t.cb(function(r) {
    t.is(r, blah)
  })
  app.attachWorkspace(ws)
  ws.emit("BC:resource", blah)
})

function setupApp(f) {
  f.conf = {
    port: 8913
  , plugIns: []
  }
  f.app = new RoilApp(f.conf)
}
