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
      if (this.window && !this.window.closed) return
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
    if (!this.opened) return
    this.window.location.reload()
  }
, close: function() {
    if (!this.opened) return
    try { this.window.close() }
    catch (e) {}
    delete this.window
    this.opened = false
  }
, focus: function() {
    if (!this.opened) return
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
    , notification = Y.one("#notification")

  if (!btn || !urlInput) return

  socket.connect()
  notification.set("innerHTML", "Connecting to server")
  socket.on("connect", function S() {
    this.removeEvent("connect", S)
    notification.set("innerHTML", "")
    socket.on("disconnect", function() {
      notification.set(
        "innerHTML"
      , "Connection lost, all pages closed for you"
      )
      Y.each(Page.pages, function(page) {
        page.close()
      })
    })
  })

  btn.on("click", openPage)
  urlInput.on("keypress", function(e) {
    if (e.keyCode == 13) openPage()
  })

  function openPage() {
    var url = urlInput.get("value").replace(/^\s+|\s+$/g)
      , page, pageElem
    if (url.slice(0, 1) !== "/") url = "/" + url
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
