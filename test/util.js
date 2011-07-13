var reut = require("reut")
  , util = require("../src/util")
 
reut.suite("Roil.util")
.test(".def()", function(t, f) {
  function Mixin() {}
  util.def(Mixin.prototype, {
    get blah(){ return this._blah }
  })

  function Klass() {}
  util.implements(Klass, Mixin)
  var instance = new Klass()
  instance._blah = true
  t.ok(instance.blah)
})
