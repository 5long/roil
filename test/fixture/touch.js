var exec = require("child_process").exec

module.exports = function(path, cb) {
  setTimeout(function() {
    exec("touch " + path, function(err) {
      if (err) throw err
      cb && cb.apply(this, arguments)
    })
  }, 2)
}
