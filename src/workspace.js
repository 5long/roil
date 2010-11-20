var lml = require("./lml")
  , FileRoll = require("./file-roll")
  , File = require("./file")
  , path = require("path")

function Workspace(dir) {
  this._workDir = dir
}
lml.inherits(Workspace, lml.EventEmitter)

lml.def(Workspace.prototype, {
  open: function(relPath) {
    var page = new FileRoll
      , absPath = path.join(this._workDir, relPath)
      , file = File.new(absPath)
    page.add(file)
    return page
  }
})

module.exports = Workspace
