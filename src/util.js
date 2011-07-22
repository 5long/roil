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
, def: function(dest, source, spec) {
    if (arguments.length < 2) throw new TypeError("Wrong number of arguments")
    var props = Object.getOwnPropertyNames(source)
    spec = spec || {blackList: []}
    props = props.filter(function(prop) {
      return !util.hasMember(spec.blackList, prop)
    })
    props.forEach(function(prop) {
      var pd = Object.getOwnPropertyDescriptor(source, prop)
      Object.defineProperty(dest, prop, pd)
    })
  }
, EventEmitter: require("events").EventEmitter
, extend: function(dest, source) {
    if (arguments.length < 2) throw new TypeError("Wrong number of arguments")
    for (var i in source) {
      dest[i] = source[i]
    }
    return dest
  }
, implements: function(klass, mixin) {
    util.def(klass.prototype, mixin.prototype, {
      blackList: ['constructor']
    })
  }
, hasMember: function(ary, value) {
    return ary.indexOf(value) >= 0
  }
, noop: new Function()
}
