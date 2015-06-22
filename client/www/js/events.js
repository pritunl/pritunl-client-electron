var WebSocket = require('ws');
var constants = require('./constants.js');
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
    var socket = new WebSocket('ws://' + constants.serviceHost + '/events');

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

    socket.on('message', function(data) {
      data = JSON.parse(data);
      callback(data);
    });
  } catch (e) {
    if (id === socketId) {
      connected = false;
    }
  }
};

var subscribe = function(callback) {
  connect(callback);

  setInterval(function() {
    connect(callback);
  }, 30000);
};

module.exports = {
  subscribe: subscribe
};
