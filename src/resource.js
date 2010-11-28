var lml = require("./lml")

function Resource(url) {
  this._url = url
  this._children = {}
  this._changeHandler = this._onChange.bind(this)
}

Resource.instances = {}
Resource.new = function(url) {
  return Resource.instances[url] = Resource.instances[url] ||
    new Resource(url)
}

lml.inherits(Resource, lml.EventEmitter)

lml.def(Resource.prototype, {
  add: function(child) {
    if (this.has(child)) return
    if (child == this) return
    this._children[child] = child
    child.on("change", this._changeHandler)
    child.watchStart()
  }
, has: function(child) {
    return child in this._children
  }
, del: function(child) {
    if (!this.has(child)) return
    child.removeListener("change", this._changeHandler)
    delete this._children[child]
  }
, _onChange: function(target) {
    if (!this.watching) return
    this.emit("change", target || this)
  }
, toString: function() {
    return "Resource: " + this._url
  }
, get url() {
    return this._url
  }
, watchStart: function() {
    this._watching = true
  }
, watchStop: function() {
    this._watching = false
  }
, get watching() {
    return this._watching
  }
})

module.exports = Resource
