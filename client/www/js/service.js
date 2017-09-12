var os = require('os');
var request = require('request');
var constants = require('./constants.js');
var logger = require('./logger.js');
var errors = require('./errors.js');

var profiles = [];
var profilesId = {};

var onUpdate = function(data) {
  for (var id in profilesId) {
    profilesId[id].update(data[id] || {
      'status': 'disconnected',
      'timestamp': null,
      'server_addr': null,
      'client_addr': null
    });
  }
};

var add = function(prfl) {
  profiles.push(prfl);
  profilesId[prfl.id] = prfl;
};

var remove = function(prfl) {
  delete profilesId[prfl.id];
  profiles.splice(profiles.indexOf(prfl));
};

var get = function(id) {
  return profilesId[id];
};

var iter = function(callback) {
  for (var i = 0; i < profiles.length; i++) {
    callback(profiles[i]);
  }
};

var update = function(callback) {
  request.get({
    url: 'http://' + constants.serviceHost + '/profile',
    headers: {
      'Auth-Key': constants.key
    }
  }, function(err, resp, body) {
    if (err) {
      err = new errors.NetworkError(
        'service: Failed to update profile (%s)', err);
    } else {
      try {
        var data = JSON.parse(body);
      } catch (e) {
        err = new errors.ParseError(
          'service: Failed to parse data (%s)', e);
        logger.error(err);
      }

      if (!err) {
        onUpdate(data);
      }
    }

    if (callback) {
      callback(err);
    }
  }.bind(this));
};

var start = function(prfl, timeout, authToken, username, password, callback) {
  if (authToken) {
    authToken += '<%=AUTH_TOKEN=%>';
    if (password) {
      password = authToken + password;
    } else {
      password = authToken;
    }
    username = username || 'pritunl';
  }

  prfl.getFullData(function(data) {
    request.post({
      url: 'http://' + constants.serviceHost + '/profile',
      json: true,
      headers: {
        'Auth-Key': constants.key
      },
      body: {
        id: prfl.id,
        username: username,
        password: password,
        reconnect: !prfl.disableReconnect,
        timeout: timeout,
        data: data
      }
    }, function(err) {
      if (err) {
        err = new errors.NetworkError(
          'service: Failed to start profile (%s)', err);
        logger.error(err);
      }
      if (callback) {
        callback(err);
      }
    });
  });
};

var stop = function(prfl, callback) {
  request.del({
    url: 'http://' + constants.serviceHost + '/profile',
    json: true,
    headers: {
      'Auth-Key': constants.key
    },
    body: {
      id: prfl.id
    }
  }, function(err) {
    if (err) {
      err = new errors.NetworkError(
        'service: Failed to stop profile (%s)', err);
      logger.error(err);
    }
    if (callback) {
      callback(err);
    }
  });
};

var ping = function(callback) {
  request.get({
    url: 'http://' + constants.serviceHost + '/ping',
    headers: {
      'Auth-Key': constants.key
    }
  }, function(err, resp) {
    if (err || !resp || resp.statusCode !== 200) {
      callback(false);
    } else {
      callback(true);
    }
  });
};

var wakeup = function(callback) {
  request.post({
    url: 'http://' + constants.serviceHost + '/wakeup',
    headers: {
      'Auth-Key': constants.key
    }
  }, function(err, resp) {
    if (err || !resp || resp.statusCode !== 200) {
      callback(false);
    } else {
      callback(true);
    }
  });
};

module.exports = {
  add: add,
  remove: remove,
  get: get,
  iter: iter,
  update: update,
  start: start,
  stop: stop,
  ping: ping,
  wakeup: wakeup
};
