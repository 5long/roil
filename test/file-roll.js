var reut = require("reut")
  , roil = require("../src")
  , FileRoll = roil.FileRoll
  , touch = require("./fixture/touch")

reut.suite("FileRoll")
.setup(function(f, done) {
  var fr = f.fr = new FileRoll()
  f.file = require("./fixture/file").f
  fr.add(f.file)
  done()
})
.teardown(function(f, done) {
  f.file.watchStop()
  done()
})
.test("works like a set", function(t, f) {
  var roll = f.fr
    , file = f.file
  t.ok(roll.has(file))
  roll.del(file)
  t.ok(!roll.has(file))
})
.test("forwarding event", function(t, f) {
  t.timeout = 15
  t.ok(f.file.watching)
  t.emits(f.fr, "change", function(file) {
    t.strictEqual(file, f.file, "just that file")
  })

  f.file.emit("change")
})
.test("not forwarding event when deleted", function(t, f) {
  f.fr.del(f.file)
  f.file.watchStart()
  f.fr.on("change", function() {
    throw Error("Should not fire")
  })
  f.file.emit("change")
})
