var spawn = require("child_process").spawn
  , Path = require("path")
  , Url = require("url")
  , fs = require("fs")
  , extend = require("./util").extend
  , util = require("util")

  , CGI_NULL = ""
  , EOL = /\r?\n/
  , EMPTY_LINE = /(?:\r?\n){2}/
  , defaultBin = {
      pl: "perl"
    , php: "php-cgi"
    }

exports.handler = cgiHandler
exports.preset = Object.keys(defaultBin).reduce(function(preset, ext) {
  preset[ext] = function(conf) {
    conf = extend({
      ext: ext
    , bin: defaultBin[ext]
    }, conf)
    return cgiHandler(conf)
  }
  return preset
}, {})

function cgiHandler(conf) {
  conf = conf || {}

  var root = conf.root || process.cwd()
    , ext = conf.ext
  if (!ext) {
    throw new Error("Must specify a file extension for CGI middleware")
  }

  var extMatch = new RegExp("\." + ext + "$")
    , cgiBin = conf.bin
    , indexScript = "index." + ext
    , sharedMeta = {
        GATEWAY_INTERFACE: "CGI/1.1"
      , REDIRECT_STATUS: "200"
      }

  return function(req, res, next) {
    var url = Url.parse(req.url)
      , pathname = url.pathname
      , scriptName
    if (pathname.charAt(pathname.length - 1) == "/") {
      pathname += indexScript
    }

    if (!extMatch.test(pathname)) return next()

    scriptName = Path.join(root, pathname)

    fs.stat(scriptName, function(err, stat) {
      if (err || !stat.isFile()) return next()

      var finalMeta = {}
        , app

      extend(finalMeta, sharedMeta)
      extend(finalMeta, {
        SCRIPT_NAME: pathname
      , QUERY_STRING: url.query || CGI_NULL
      , SCRIPT_FILENAME: scriptName
      , DOCUMENT_ROOT: root
      , REQUEST_METHOD: req.method
      , REMOTE_ADDRESS: req.connection.remoteAddress
      , REMOTE_PORT: req.connection.remotePort
      , SERVER_PROTOCOL: "HTTP/" + req.httpVersion
      , REQUEST_URI: req.url
      })
      extend(finalMeta, headerToMeta(req.headers))

      app = cgiBin
        ? spawn(cgiBin, [scriptName], finalMeta)
        : spawn(scriptName, [], finalMeta)

      cgiPump(app.stdout, res)
    })
  }
}

function cgiPump(readStream, res) {
  var headerDone = false
    , bytesPassed = 0
    , trailing = ""

  readStream.on("end", function() {
    res.end()
  })

  readStream.on("data", function(chunk) {
    if (headerDone) return res.write(chunk)

    trailing += chunk.toString("ascii")
    headerDone = EMPTY_LINE.test(trailing)
    if (!headerDone) {
      bytesPassed += chunk.length
      return
    }

    var rawHeaderStr = RegExp.leftContext
      , offset = rawHeaderStr.length + RegExp.lastMatch.length - bytesPassed
      , firstBody = chunk.slice(offset, chunk.length)
      , rawHeaders = rawHeaderStr.split(EOL)
      , headers = {}

    rawHeaders.reduce(function(headers, line) {
      var matched = line.match(/^([^:]+): +(.*)$/)
      if (matched) headers[matched[1]] = matched[2]
      return headers
    }, headers)

    var status = parseInt(headers.Status, 10) || 200
    delete headers.Status
    res.writeHead(status, headers)
    res.write(firstBody)
  })
}

function headerToMeta(headers) {
  var meta = {}
    , metaKey, key
  for (key in headers) {
    metaKey = "HTTP_" + key.replace(/-/g, "_").toUpperCase()
    meta[metaKey] = headers[key]
  }
  return meta
}
