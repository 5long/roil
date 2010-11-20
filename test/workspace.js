var reut = require("reut")
  , roil = require("../src")
  , Workspace = roil.Workspace
  , FileRoll = roil.FileRoll
  , File = roil.File
  , path = require("path")
  , touch = require("./fixture/touch")

reut.suite("Workspace Class")
.setup(function(f, done) {
  f.ws = new Workspace(__dirname)
  done()
})
.test(".open()", function(t, f) {
  t.timeout = 50
  var page = f.ws.open(path.basename(__filename))
  t.typeOf(page.on, "function")
  t.emits(page, "change", function() {
    File.new(__filename).watchStop()
    t.end()
  })
  touch(__filename)
})
