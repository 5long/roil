var lml = require("./lml")

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
lml.inherits(Client, lml.EventEmitter)

module.exports = Client
