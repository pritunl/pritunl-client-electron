var path = require('path');

var remote;
try {
  remote = require('remote');
} catch(err) {
}

var fs;
var app;
if (remote) {
  fs = remote.require('fs');
  app = remote.require('app');
} else {
  fs = require('fs');
  app = require('app');
}

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
