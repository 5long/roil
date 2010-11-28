var lml = require("./lml")

function Resource() {
  this._files = {}
  this._changeHandlers = {}
}

lml.inherits(Resource, lml.EventEmitter)

lml.def(Resource.prototype, {
  add: function(file) {
    if (this.has(file)) return
    this._files[file] = file
    var changeHandler = this._onChange.bind(this, file)
    this._changeHandlers[file] = changeHandler
    file.on("change", changeHandler)
    file.watchStart()
  }
, has: function(file) {
    return file in this._files
  }
, del: function(file) {
    if (!this.has(file)) return
    file.removeListener("change", this._changeHandlers[file])
    delete this._files[file]
    delete this._changeHandlers[file]
  }
, _onChange: function(file, current, prev) {
    this.emit("change", file, current, prev)
  }
})

module.exports = Resource
