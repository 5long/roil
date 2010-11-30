function Page(url, backend, opener) {
  Y.EventTarget.call(this)
  if (Page.pages.hasOwnProperty(url)) return Page.pages[url]
  var self = Page.pages[url] = Page.latest = this
  this.url = url
  this.backend = backend || new io.Socket()
  this.opener = opener || window
  this.opened = false

  this.backend.on("message", function(msg) {
    try { msg = JSON.parse(msg) }
    catch (e) { Y.log("Parse error on message:", msg) }
    if (msg && msg.type == "change") self.refresh()
  })
}

Y.extend(Page, Y.EventTarget, {
  open: function() {
    if (this.opened) return this.focus()
    this.opened = true
    this.window = this.opener.open(this.url)
    this.timer = Y.later(100, this, function() {
      if (!this.window.closed) return
      this.fire("close")
      this.close()
      this.timer.cancel()
    }, [], true)

    this.backend.send(JSON.stringify({
      action: "open"
    , url: this.url
    }))
  }
, refresh: function() {
    this.window.location.reload()
  }
, close: function() {
    if (!this.opened) return
    this.window.close()
    this.opened = false
  }
, focus: function() {
    this.window.focus()
  }
, toElement: function() {
    var self = this
    this.elem = this.elem
      || Y.Node.create("<li>" + this.url)
          .set("title", "Click to close this page")
          .addClass("pageItem")
    return this.elem
  }
}, {
  latest: null
, pages: {}
})

Y.on("load", function roilInit() {
  var btn = Y.one("#submitUrl")
    , urlInput = Y.one("#url")
    , pageList = Y.one("#pages")
    , pages = Page.pages
    , socket = new io.Socket()

  if (!btn || !urlInput) return

  socket.connect()
  btn.on("click", openPage)
  urlInput.on("keypress", function(e) {
    if (e.keyCode == 13) openPage()
  })

  function openPage() {
    var url = urlInput.get("value").replace(/^\s+|\s+$/)
      , page, pageElem
    if (url[0] !== "/") url = "/" + url
    page = new Page(url, socket)
    page.open()
    pageElem = page.toElement()
    pageList.append(pageElem)
    pageElem.on("click", function() {
      page.close()
    })
    page.on("close", function() {
      pageElem.remove()
    })
  }
})
