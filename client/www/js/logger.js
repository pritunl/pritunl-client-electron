var fs = require('fs');
var app = require('app');
var path = require('path');

var pth = path.join(app.getPath('userData'), 'pritunl.log');

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
  push('ERROR', msg);
};

module.exports = {
  info: info,
  warning: warning,
  error: error
};
