var lml = require("./lml")

function User(transport) {
  this._pages = []
  this._transport = transport
  transport.on("message", function(msg) {
    if (msg.action != "open") return
    if (!this._workspace) return
    var page = this._workspace.open(msg.url)
    this._addPage(page)
  }.bind(this))
}

lml.def(User.prototype, {
  use: function(ws) {
    this._workspace = ws
  }
, _addPage: function(page) {
    this._pages.push(page)
    page.on("change", function() {
      this._transport.send()
    }.bind(this))
  }
})

module.exports = User
