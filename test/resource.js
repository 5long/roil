var reut = require("reut")
  , roil = require("../src")
  , Resource = roil.Resource

reut.suite("Resource")
.setup(function(f, done) {
  f.url = "/foo"
  var res = f.res = Resource.new(f.url)
  f.anotherRes = Resource.new(f.url)
  f.file = require("./fixture/file").f
  res.add(f.file)
  done()
})
.teardown(function(f, done) {
  f.res.del(f.file)
  f.file.watchStop()
  Resource.instances = {}
  done()
})
.test("identified by url", function(t, f) {
  t.equal(f.res, "Resource: " + f.url, "toString()")
  t.is(f.anotherRes, f.res)
})
.test("works like a set", function(t, f) {
  var res = f.res
    , file = f.file
  t.ok(res.has(file))
  res.del(file)
  t.ok(!res.has(file))
})
.test("forwarding event", function(t, f) {
  t.timeout = 15
  t.ok(f.file.watching)
  f.res.watchStart()
  t.emits(f.res, "change", function(file) {
    t.strictEqual(file, f.file, "just that file")
  })

  f.file.emit("change", f.file)
})
.test("not forwarding event when deleted", function(t, f) {
  f.res.del(f.file)
  f.file.watchStart()
  f.res.on("change", function() {
    throw new Error("Should not fire")
  })
  f.file.emit("change")
})
.test("addDep()", function(t, f) {
  var res = f.res
    , depUrl = '/blah'
    , dep = Resource.new(depUrl)
  res.addDep(dep)
  t.ok(res.has(dep))
  res.del(dep)
  t.ok(!res.has(dep))
  res.addDep(depUrl)
  t.ok(res.has(dep))
})
