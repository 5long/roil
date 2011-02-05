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

function cgiHandler(conf) {
  conf = conf || {}

  var docRoot = conf.docRoot || process.cwd()
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

    scriptName = Path.join(docRoot, pathname)

    fs.stat(scriptName, function(err, stat) {
      if (err || !stat.isFile()) return next()

      var finalMeta = {}
        , app

      extend(finalMeta, sharedMeta)
      extend(finalMeta, {
        SCRIPT_NAME: pathname
      , QUERY_STRING: url.query || CGI_NULL
      , SCRIPT_FILENAME: scriptName
      , DOCUMENT_ROOT: docRoot
      , REQUEST_METHOD: req.method
      , REMOTE_ADDRESS: req.connection.remoteAddress
      , SERVER_PROTOCOL: "HTTP/" + req.httpVersion
      , REQUEST_URI: req.url
      })

      app = cgiBin
        ? spawn(cgiBin, [scriptName], finalMeta)
        : spawn(scriptName, [], finalMeta)

      cgiPump(app.stdout, res)
    })
  }
}

exports.handler = cgiHandler
exports.preset = Object.keys(defaultBin).reduce(function(preset, ext) {
  preset[ext] = cgiHandler({
    ext: ext
  , bin: defaultBin[ext]
  })
  return preset
}, {})

function cgiPump(readStream, res) {
  var headerDone = false
    , trailing = ""

  readStream.on("end", function() {
    res.end()
  })

  readStream.on("data", function(chunk) {
    if (headerDone) return res.write(chunk)

    trailing += chunk.toString("ascii")
    headerDone = EMPTY_LINE.test(trailing)
    if (!headerDone) return

    var firstBody = RegExp.rightContext
      , rawHeaders = RegExp.leftContext.split(EOL)
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
