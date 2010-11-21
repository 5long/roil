var lml = require("./lml")
  , url = require("url")

function User(transport) {
  this._pages = {}
  this._transport = transport
  transport.on("message", this._onClientMessage.bind(this))
}

lml.def(User.prototype, {
  use: function(ws) {
    this._workspace = ws
  }
, _addPage: function(page, url) {
    this._pages[url] = page
    page.on("change", function() {
      this._transport.send({
        type: "change"
      , url: url
      })
    }.bind(this))
  }
, _onClientMessage: function(msg) {
    if (msg.action != "open") return
    if (!this._workspace) return
    var page = this._workspace.open(url.parse(msg.url).pathname)
    this._addPage(page, msg.url)
  }
})

module.exports = User
