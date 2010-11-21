var reut = require("reut")
  , roil = require("../src")
  , User = roil.User
  , EventEmitter = require("events").EventEmitter
  , parse = require("url").parse

reut.suite("User Class")
.setup(function(f, done) {
  f.transport = new EventEmitter()
  f.fileRoll = new EventEmitter()
  f.workspace = {
    open: function(url) {
      return f.fileRoll
    }
  }
  f.u = new User(f.transport)
  f.u.use(f.workspace)
  f.url = "http://foo.bar.org/"
  done()
})
.test("forward open action from transport", function(t, f) {
  var wsOpen = f.workspace.open
  f.workspace.open = t.cb(function(url) {
    t.is(url, parse(f.url).pathname)
    return wsOpen.apply(this, arguments)
  })
  f.transport.emit("message", {
    action: 'open'
  , url: f.url
  })
})
.test("forward file change to transport", function(t, f) {
  f.transport.send = t.cb()
  f.u._addPage(f.fileRoll)
  f.fileRoll.emit("change")
})
