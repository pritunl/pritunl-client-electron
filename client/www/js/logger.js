var path = require('path');
var remotes = requireRemotes();

var alert;
try {
  require('remote');
  alert = require('./alert.js');
} catch (e) {
}

var pth = path.join(remotes.getUserDataPath(), 'pritunl.log');

var push = function(lvl, msg) {
  var time = new Date();
  msg = '[' + time.getFullYear() + '-' + (time.getMonth() + 1) + '-' +
    time.getDate() + ' ' +  time.getHours() + ':' + time.getMinutes() + ':' +
    time.getSeconds() + '][' + lvl  + '] ' + msg + '\n';

  remotes.appendFile(pth, msg, function() {});
};

var info = function(msg) {
  push('INFO', msg);
};

var warning = function(msg) {
  push('WARN', msg);
};

var error = function(msg) {
  if (alert) {
    alert.error(msg);
  }
  push('ERROR', msg);
};

module.exports = {
  info: info,
  warning: warning,
  error: error
};
