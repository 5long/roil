var s = new io.Socket()
  , pages = {}
  , latest = null

s.connect()
s.on("message", function(msg) {
  var e
  try {msg = JSON.parse(msg)}
  catch (e) {return}
  if (msg && msg.type == "change") refresh(msg.url)
})

function start(url) {
  s.send(JSON.stringify({
    action: "open"
  , url: url
  }))
  latest = pages[url] = window.open(url)
}

function refresh(url) {
  var page = pages[url]
  page.location.reload()
}
