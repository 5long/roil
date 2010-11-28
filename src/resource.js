var lml = require("./lml")

function Resource(url) {
  this._url = url
  this._children = {}
  this._changeHandlers = {}
}

lml.inherits(Resource, lml.EventEmitter)

lml.def(Resource.prototype, {
  add: function(child) {
    if (this.has(child)) return
    this._children[child] = child
    var changeHandler = this._onChange.bind(this, child)
    this._changeHandlers[child] = changeHandler
    child.on("change", changeHandler)
    child.watchStart()
  }
, has: function(child) {
    return child in this._children
  }
, del: function(child) {
    if (!this.has(child)) return
    child.removeListener("change", this._changeHandlers[child])
    delete this._children[child]
    delete this._changeHandlers[child]
  }
, _onChange: function(child, current, prev) {
    this.emit("change", child, current, prev)
  }
, toString: function() {
    return "Resource: " + this._url
  }
})

module.exports = Resource
