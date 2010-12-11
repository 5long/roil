/*
 * EXT JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

// Monkey patched so we can attach the console server to a specific
// path (much like Socket.IO)

var util, fs = require('fs')
  , Path = require('path')
  , parseUrl = require('url').parse
  , mime = require("./mime")

try {
  util = require("util")
} catch (e) {
  util = require("sys")
}

module.exports = function staticProvider(options){
  if (typeof options == 'string') {
    options = {root: options}
  }

  options = options || {}
  var root = options.root || process.cwd()
    , pathHead = options.pathHead || "/"
    , indexName = "index.html"

  return function staticProvider(req, res, next) {
    next = next || new Function()
    if (req.method != 'GET' && req.method != 'HEAD') return next()

    var head = req.method == 'HEAD'
      , url = parseUrl(req.url)
      , relPath = url.pathname
      , filename

    if (relPath.indexOf(pathHead) === 0) {
      // Leading slash should be preserved.
      relPath = relPath.slice(pathHead.length).replace(/^(?=[^\/]|$)/, "/")
    } else {
      return next()
    }

    filename = Path.join(root, relPath)

    if (filename.slice(-1) === '/') {
      filename += indexName
    }

    fs.stat(filename, function(err, stat){
      if (err) {
        return err.errno === process.ENOENT
          ? next()
          : next(err)
      } else if (stat.isDirectory()) {
        return next()
      }

      var stream, headers = {
        "Content-Length": stat.size
      , "Content-Type": mime.type(filename)
      }

      res.writeHead(200, headers)
      if (req.method == "HEAD") {
        res.end()
        return
      }

      stream = fs.createReadStream(filename)
      util.pump(stream, res, function(err) {
        if (err) return next(err)
        res.end()
      })
    })
  }
}
