var reut = require("reut")
  , roil = require("../src")
  , touch = require("./fixture/touch")
  , fs = require("fs")
  , path = require("path")

reut.suite("RollUnit")
.setup(function(f, done) {
  f.path = __dirname + "/../Makefile"
  f.fullpath = path.normalize(f.path)
  f.file = roil.File.new(f.path)
  done()
})
.teardown(function(f, done) {
  delete f.file
  done()
})
.test("Basic usage", function(t, f) {
  var file = f.file
    , p = f.path

  t.timeout = 500

  t.equal(file.path, f.fullpath, "got the path")
  t.equal(file, f.fullpath, "toString()")
  t.ok(!file.watching)

  t.emits(file, "change", function(stat) {
    t.typeOf(stat, "object", "got the file stat")
    t.instanceOf(stat, fs.Stats)
    this.watchStop()
    t.ok(!file.watching)
    t.end()
  })

  t.throws(function() {
    file.watching = "blah"
  })
  t.throws(function() {
    file.path = "what ever"
  })

  file.watchStart()
  t.ok(file.watching)
  touch(f.fullpath)
})
.test("back and forth", function(t, f) {
  t.timeout = 15
  var file = f.file
  file.watchStart()
  file.watchStop()
  t.ok(!file.watching)
  file.on("change", function() {
    throw Error("Should not fire")
  })
  touch(file.path)
})
