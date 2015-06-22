var util = require('util');

global.ErrorInit = function(stack, message, args) {
  if (args.length > 1) {
    message = util.format.apply(this, args);
  }
  var s = message.split(': ', 2);
  this.name = 'NetworkError';
  this.message = message;
  this.module = s[0];
  this.formatted = s[1];
  this.stack = stack;
};
