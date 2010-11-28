var reut = require("reut")
  , roil = require("../src")
  , StaticWatcher = roil.watcher.Static
  , EventEmitter = require("events").EventEmitter
  , path = require("path")

reut.suite("StaticWatcher")
.setup(function(f, done) {
  f.baseDir = __dirname
  f.req = {
    url: "/" + path.basename(__filename)
  }
  f.sw = new StaticWatcher(f.baseDir)
  done()
})
.test("Works like this", function(t, f) {
  var sw = f.sw
    , closure = sw.closure
  t.emits(sw, "relate", function(event) {
    t.equal(event.resource.path, __filename)
  })
  closure(f.req)
})
