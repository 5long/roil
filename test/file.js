var reut = require("reut")
  , roil = require("../src")
  , fs = require("fs")
  , path = require("path")
  , fakeFs = {
      paths: {}
    , watchFile: function(path, cb) {
        this.paths[path] = cb
      }
    , unwatchFile: function(path) {
        delete this.paths[path]
      }
    , touch: function(path) {
        var cb = this.paths[path]
        cb && cb()
      }
    }

reut.suite("File")
.setup(function(f, done) {
  f.path = __dirname + "/../Makefile"
  f.fullpath = path.normalize(f.path)
  f.file = roil.File.new(f.path)
  f.file._watchModule = fakeFs
  done()
})
.teardown(function(f, done) {
  delete f.file
  fakeFs.paths = {}
  done()
})
.test("Basic usage", function(t, f) {
  var file = f.file
    , p = f.path

  t.equal(file.path, f.fullpath, "got the path")
  t.equal(file, f.fullpath, "toString()")
  t.ok(!file.watching)

  t.emits(file, "change", function(stat) {
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
  fakeFs.touch(f.fullpath)
})
.test("back and forth", function(t, f) {
  var file = f.file
  file.watchStart()
  file.watchStop()
  t.ok(!file.watching)
  file.on("change", function() {
    throw Error("Should not fire")
  })
  fakeFs.touch(file.path)
})
