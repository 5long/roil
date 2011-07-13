var util = require("./util")
  , AbstractResource = require("./abstract_resource")

function Resource(url) {
  AbstractResource.call(this)
  this._url = url
}

Resource.instances = {}
Resource.new = function(url) {
  return Resource.instances[url] = Resource.instances[url] ||
    new Resource(url)
}

util.inherits(Resource, AbstractResource)

util.def(Resource.prototype, {
  toString: function() {
    return "Resource: " + this._url
  }
, get url() {
    return this._url
  }
})

module.exports = Resource
