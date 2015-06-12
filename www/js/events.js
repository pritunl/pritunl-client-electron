var WebSocket = require('ws');
var utils = require('./utils.js');

var connected = false;
var socketId = null;

var connect = function(callback) {
  if (connected) {
    return;
  }
  var id = utils.uuid();
  socketId = id;

  try {
    var socket = new WebSocket('ws://localhost:9770/events');

    socket.on('onerror', function() {
      connected = false;
    });

    socket.on('open', function() {
      if (connected || id !== socketId) {
        socket.close();
        return;
      }

      connected = true;
    });

    socket.on('close', function() {
      if (id === socketId) {
        connected = false;
      }
    });

    socket.on('message', function(data, flags) {
      data = JSON.parse(data);
      callback(data);
    });
  } catch(err) {
    if (id === socketId) {
      connected = false;
    }
  }
};

var subscribe = function(callback) {
  connect(callback);

  setInterval(function() {
    connect(callback);
  }, 5000);
};

module.exports = {
  subscribe: subscribe
};
