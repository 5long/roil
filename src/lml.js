// Little missing library, that's it.
var util = module.exports = {
  inherits: function(klass, super) {
    klass.prototype = Object.create(super.prototype)
    Object.defineProperty(klass.prototype, "constructor", {
      value: klass
    , writable: true
    , configurable: true
    , enumerable: false
    })
  }
, def: function(dest, source) {
    if (arguments.length < 2) throw TypeError("Wrong number of arguments")
    var props = Object.getOwnPropertyNames(source)
    props.forEach(function(prop) {
      var pd = Object.getOwnPropertyDescriptor(source, prop)
      Object.defineProperty(this, prop, pd)
    }, dest)
  }
, EventEmitter: require("events").EventEmitter
}
