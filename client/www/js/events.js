var WebSocket = require('ws');
var constants = require('./constants.js');

var connect = function(callback) {
  var reconnected = false;
  var url;
  var headers = {
    'Auth-Key': constants.key,
    'User-Agent': 'pritunl'
  };

  if (constants.unixSocket) {
    url = 'ws+unix://' + constants.unixPath + ':/events';
    headers['Host'] = 'unix';
  } else {
    url = 'ws://' + constants.serviceHost + '/events';
  }

  var socket = new WebSocket(url, {
    headers: headers
  });

  var reconnect = function() {
    if (reconnected) {
      return;
    }
    reconnected = true;
    setTimeout(function() {
      connect(callback);
    }, 500);
  };

  socket.on('onerror', reconnect);
  socket.on('error', reconnect);
  socket.on('close', reconnect);

  socket.on('message', function(data) {
    data = JSON.parse(data);

    if (data.type === 'wakeup') {
      socket.send('awake');
    }

    callback(data);
  });
};

var subscribe = function(callback) {
  connect(callback);
};

module.exports = {
  subscribe: subscribe
};
