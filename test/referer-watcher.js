var reut = require("reut")
  , roil = require("../src")
  , RefererWatcher = roil.watcher.Referer
  , EventEmitter = require("events").EventEmitter
  , path = require("path")
  , fakeRequest = {
      url: "/" + path.basename(__filename)
    , headers: {
        "referer": "http://some.host.com/bar"
      }
    }

reut.suite("RefererWatcher Class")
.setup(function(f, done) {
  f.rw = new RefererWatcher()
  done()
})
.test("Parse request", function(t, f) {
  var rw = f.rw
    , closure = rw.closure
  t.typeOf(closure, "function")
  t.emits(rw, "relate", function(event) {
    t.equal(event.resource.url, fakeRequest.url)
    t.equal(event.belongTo.url, "/bar")
  })
  closure(fakeRequest)
})
