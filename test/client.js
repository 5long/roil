var reut = require("reut")
  , roil = require("../src")
  , Client = roil.Client
  , EventEmitter = require("../src/util").EventEmitter
  , sampleMessage = {
      action: 'open'
    , url: 'blah'
    }

reut.suite("Client Class")
.test("Constructor", function(t, f) {
  var c = new Client(new EventEmitter)
})
.setup(function(f, done) {
  f.fakeSocket = new EventEmitter()
  f.client = new Client(f.fakeSocket)
  done()
})
.test("Event forward", function(t, f) {
  t.emits(f.client, "message", function(msg) {
    t.deepEqual(msg, sampleMessage)
  })
  f.fakeSocket.emit("message", JSON.stringify(sampleMessage))
})
.test(".send()", function(t, f) {
  f.fakeSocket.send = t.cb(function(msg) {
    t.deepEqual(JSON.parse(msg), sampleMessage)
  })
  f.client.send(sampleMessage)
})
