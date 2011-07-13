// Little missing library, that's it.
var util = module.exports = {
  inherits: function(klass, super) {
    klass.prototype.__proto__ = super.prototype
    Object.defineProperty(klass.prototype, "constructor", {
      value: klass
    , writable: true
    , configurable: true
    , enumerable: false
    })
    klass.super_ = super
  }
, def: function(dest, source) {
    if (arguments.length < 2) throw TypeError("Wrong number of arguments")
    var props = Object.getOwnPropertyNames(source)
    props.forEach(function(prop) {
      var pd = Object.getOwnPropertyDescriptor(source, prop)
      Object.defineProperty(dest, prop, pd)
    })
  }
, EventEmitter: require("events").EventEmitter
, isFunc: function(obj) {
    return Object.prototype.toString.call(obj) == "[object Function]"
  }
, extend: function(dest, source) {
    if (arguments.length < 2) throw TypeError("Wrong number of arguments")
    for (var i in source) {
      dest[i] = source[i]
    }
    return dest
  }
, implements: function(klass, mixin) {
    util.def(klass.prototype, mixin.prototype)
  }
, noop: new Function()
}
