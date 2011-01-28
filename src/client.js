var util = require("./util")

function Client(socket) {
  var self = this
  socket.on("message", function(msg) {
    var e
    try { msg = JSON.parse(msg) }
    catch (e) { return }
    self.emit("message", msg)
  })
  this._socket = socket
}
util.inherits(Client, util.EventEmitter)

util.def(Client.prototype, {
  send: function(msg) {
    this._socket.send(JSON.stringify(msg))
  }
})

module.exports = Client
