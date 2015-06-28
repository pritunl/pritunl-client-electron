var util = require('util');

global.ErrorInit = function(name, args) {
  var message;
  if (args.length > 1) {
    message = util.format.apply(this, args);
  } else {
    message = args[0];
  }

  var s = message.split(': ', 2);
  this.module = s[0];
  this.formatted = s[1];

  this.name = name;
  this.message = message;

  this.stack = (new Error()).stack;
};

global.remoteRequire = function(name) {
  try {
    var remote = require('remote');
    return remote.require(name);
  } catch (e) {
    return require(name);
  }
};
