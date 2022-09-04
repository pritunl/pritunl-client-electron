var path = require('path');
var fs = require('fs');
var utils = require('./utils.js');
var alert = require('./alert.js')

var pth = path.join(utils.getUserDataPath(), 'pritunl-client.log');

var push = function(lvl, msg) {
  var time = new Date();
  msg = '[' + time.getFullYear() + '-' + (time.getMonth() + 1) + '-' +
    time.getDate() + ' ' +  time.getHours() + ':' + time.getMinutes() + ':' +
    time.getSeconds() + '][' + lvl  + '] ' + msg + '\n';

  fs.appendFile(pth, msg, function() {});
};

var info = function(msg) {
  push('INFO', msg);
};

var warning = function(msg) {
  push('WARN', msg);
};

var error = function(msg) {
  if (alert) {
    if (msg.formatted) {
      alert.error(msg.formatted);
    } else {
      alert.error(msg);
    }
  }
  push('ERROR', msg);
};

module.exports = {
  info: info,
  warning: warning,
  error: error
};
