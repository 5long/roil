var reut = require("reut")
  , RoilApp = require("../src/app")
  , WebResource = require("../src/resource")

reut.suite("App class")
.setup(function(f) {
  f.conf = {
    port: 8913
  , plugIns: []
  }
  f.app = new RoilApp(f.conf)
})
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
