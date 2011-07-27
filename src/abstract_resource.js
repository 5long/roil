var util = require("./util")

function AbstractResource() {
  this._deps = {}
  this._changeHandler = this._onChange.bind(this)
  AbstractResource.super_.call(this)
}

util.inherits(AbstractResource, util.EventEmitter)

util.def(AbstractResource.prototype, {
  get watching() {
    return this._watching
  }
, watchStart: function() {
    this._watching = true
  }
, watchStop: function() {
    this._watching = false
  }
, add: function(child) {
    if (this.has(child)) return
    if (child == this) return
    this._deps[child] = child
    child.on("change", this._changeHandler)
    child.watchStart()
    this.emit("newDep", child)
  }
, addDep: function(dep) {
    if (typeof dep == 'string') {
      dep = this.constructor.new(dep)
    }
    this.add(dep)
  }
, has: function(child) {
    return child in this._deps
  }
, del: function(child) {
    if (!this.has(child)) return
    child.removeListener("change", this._changeHandler)
    delete this._deps[child]
  }
, _onChange: function(target) {
    if (!this.watching) return
    this.emit("change", target || this)
  }
, forEachDep: function(cb, context) {
    for (var i in this._deps) {
      var dep = this._deps[i]
      cb.call(context, dep)
    }
  }
})

module.exports = AbstractResource
