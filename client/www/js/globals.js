var util = require('util');

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

global.remoteRequire = function() {
  try {
    var remote = require('@electron/remote');
    if (remote) {
      return remote;
    }
  } catch (e) {
  }
  return require('electron');
};
