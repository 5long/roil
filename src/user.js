var lml = require("./lml")

function User(transport) {
  this._transport = transport
  transport.on("message", function(msg) {
    if (msg.action != "open") return
    this._workspace.open(msg.url)
  }.bind(this))
}

lml.def(User.prototype, {
  use: function(ws) {
    this._workspace = ws
  }
})

module.exports = User
