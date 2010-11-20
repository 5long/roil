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
  f.sp = new RefererWatcher(__dirname)
  done()
})
.test("Parse request", function(t, f) {
  var sp = f.sp
    , closure = sp.closure
  t.typeOf(closure, "function")
  t.emits(sp, "relate", function(file) {
    t.equal(file.path, __filename)
    t.equal(file.belongTo, path.join(__dirname, "/bar"))
  })
  closure(fakeRequest)
})
