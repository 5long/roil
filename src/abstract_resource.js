var util = require("./util")

function AbstractResource() {
  this._deps = {}
  this._changeHandler = this._onChange.bind(this)
}

util.inherits(AbstractResource, util.EventEmitter)

util.def(AbstractResource.prototype, {
  get watching() {
    return this._watching
  }
, add: function(child) {
    if (this.has(child)) return
    if (child == this) return
    this._deps[child] = child
    child.on("change", this._changeHandler)
    child.watchStart()
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
})

module.exports = AbstractResource
