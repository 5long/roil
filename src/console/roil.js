var s = new io.Socket()
  , pages = {}
  , latest = null

s.connect()

function Page(url) {
  var self = this
  this.url = url
  pages[url] = latest = this
  this.backend.on("message", function(msg) {
    msg = JSON.parse(msg)
    if (msg && msg.type == "change") self.refresh()
  })
}

Page.prototype = {
  backend: s
, open: function() {
    this.window = window.open(this.url)
    this.backend.send(JSON.stringify({
      action: "open"
    , url: this.url
    }))
  }
, refresh: function() {
    this.window.location.reload()
  }
, close: function() {
    this.window.close()
  }
, focus: function() {
    this.window.focus()
  }
, toElement: function() {
    var frag = document.createDocumentFragment()
      , text = document.createTextNode()
    text.nodeValue = this.url
    frag.appendChild(text)
    return frag
  }
}

window.onload = function roilInit() {
  var btn = document.getElementById("submitUrl")
    , urlInput = document.getElementById("url")
    , pageList = document.getElementById("pages")
  if (!btn || !urlInput) return
  btn.onclick = function() {
    var url = urlInput.value.replace(/^\s+|\s+$/)
      , page, pageElem
    if (url[0] !== "/") url = "/" + url
    if (url in pages) return
    page = pages[url] = new Page(url)
    page.open()
    pageElem = document.createElement("li")
    pageElem.appendChild(page.toElement())
    pageList.appendChild(pageElem)
  }
}
