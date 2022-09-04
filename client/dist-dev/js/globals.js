var util = require('util');
var process = require('process');
var path = require('path');
var constants = require('./constants.js');

global.ErrorInit = function(name, args) {
  var message;
  if (args.length > 1) {
    message = util.format.apply(this, args);
  } else {
    message = args[0];
  }

  var s = message.split(': ');
  this.module = s[0];
  this.formatted = s.slice(1).join(': ');

  this.name = name;
  this.message = message;

  this.stack = (new Error()).stack;
};

if (process.platform === 'linux' || process.platform === 'darwin') {
  global.unixSocket = true;
  constants.unixSocket = true;
}

var systemDrv = process.env.SYSTEMDRIVE;
if (systemDrv) {
  constants.winDrive = systemDrv + '\\';
}

var args = {};
var queryVals = window.location.search.substring(1).split('&');
for (var item of queryVals) {
  var items = item.split('=');
  if (items.length < 2) {
    continue;
  }

  var key = items[0];
  var value = items.slice(1).join('=');

  args[key] = decodeURIComponent(value);
}

if (args['dev'] === 'true') {
  global.production = false;
  global.authPath = path.join(__dirname, '..', '..', 'dev', 'auth');
} else {
  if (process.platform === 'win32') {
    global.authPath = path.join(
      constants.winDrive, 'ProgramData', 'Pritunl', 'auth');
  } else {
    global.authPath = path.join(path.sep, 'var', 'run', 'pritunl.auth');
  }
}
