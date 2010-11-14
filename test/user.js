var reut = require("reut")
  , roil = require("../src")
  , User = roil.User
  , EventEmitter = require("events").EventEmitter

reut.suite("User Class")
.setup(function(f, done) {
  f.transport = new EventEmitter()
  f.fileRoll = new EventEmitter()
  f.workspace = {
    open: function(url, cb) {
      process.nextTick(function() {
        cb(null, f.fileRoll)
      })
    }
  }
  f.u = new User(f.transport)
  f.u.use(f.workspace)
  f.url = "http://foo.bar.org/"
  done()
})
.test("forward open action from transport", function(t, f) {
  f.workspace.open = t.cb(function(url) {
    t.is(url, f.url)
  })
  f.transport.emit("message", {
    action: 'open'
  , url: f.url
  })
})
