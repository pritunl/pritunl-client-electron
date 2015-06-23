var WebSocket = require('ws');
var constants = require('./constants.js');

var connect = function(callback) {
  var socket = new WebSocket('ws://' + constants.serviceHost + '/events');

  var reconnect = function() {
    setTimeout(function() {
      connect(callback);
    }, 500);
  };

  socket.on('onerror', reconnect);
  socket.on('error', reconnect);
  socket.on('close', reconnect);

  socket.on('message', function(data) {
    console.log(data);
    data = JSON.parse(data);
    callback(data);
  });
};

var subscribe = function(callback) {
  connect(callback);
};

module.exports = {
  subscribe: subscribe
};
