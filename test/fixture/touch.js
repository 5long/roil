var exec = require("child_process").exec

module.exports = function(path, cb) {
  exec("touch " + path, {timeout: 100}, function(err) {
    if (err) throw err
    cb && cb.apply(this, arguments)
  })
}
