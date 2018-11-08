var os = require('os');
var request = require('request');
var constants = require('./constants.js');
var logger = require('./logger.js');
var config = require('./config.js');
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
      'Auth-Key': constants.key,
      'User-Agent': 'pritunl'
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

var start = function(prfl, timeout, serverPubKey,
    username, password, callback) {
  username = username || 'pritunl';

  if (serverPubKey) {
    serverPubKey = serverPubKey.join('\n');
  } else {
    serverPubKey = null;
  }

  prfl.getFullData(function(data) {
    var reconnect = prfl.disableReconnect ? false :
      !config.settings.disable_reconnect;

    request.post({
      url: 'http://' + constants.serviceHost + '/profile',
      json: true,
      headers: {
        'Auth-Key': constants.key,
        'User-Agent': 'pritunl'
      },
      body: {
        id: prfl.id,
        username: username,
        password: password,
        server_public_key: serverPubKey,
        reconnect: reconnect,
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
      'Auth-Key': constants.key,
      'User-Agent': 'pritunl'
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

var tokenUpdate = function(prfl, callback) {
  request.put({
    url: 'http://' + constants.serviceHost + '/token',
    json: true,
    headers: {
      'Auth-Key': constants.key,
      'User-Agent': 'pritunl'
    },
    body: {
      profile: prfl.id,
      ttl: prfl.tokenTtl,
    }
  }, function(err, resp, body) {
    if (err) {
      err = new errors.NetworkError(
        'service: Failed to update token (%s)', err);
      logger.error(err);
    } else {
      if (callback) {
        callback(null, body.valid);
      }
      return;
    }

    if (callback) {
      callback(err);
    }
  });
};

var tokenDelete = function(prfl, callback) {
  request.del({
    url: 'http://' + constants.serviceHost + '/token',
    json: true,
    headers: {
      'Auth-Key': constants.key,
      'User-Agent': 'pritunl'
    },
    body: {
      profile: prfl.id
    }
  }, function(err) {
    if (err) {
      err = new errors.NetworkError(
        'service: Failed to delete token (%s)', err);
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
      'Auth-Key': constants.key,
      'User-Agent': 'pritunl'
    }
  }, function(err, resp) {
    var statusCode = resp ? resp.statusCode : null;
    if (err || statusCode !== 200) {
      callback(false, statusCode);
    } else {
      callback(true, statusCode);
    }
  });
};

var wakeup = function(callback) {
  request.post({
    url: 'http://' + constants.serviceHost + '/wakeup',
    headers: {
      'Auth-Key': constants.key,
      'User-Agent': 'pritunl'
    }
  }, function(err, resp) {
    var statusCode = resp ? resp.statusCode : null;
    if (err || statusCode !== 200) {
      callback(false, statusCode);
    } else {
      callback(true, statusCode);
    }
  });
};

module.exports = {
  add: add,
  remove: remove,
  get: get,
  iter: iter,
  update: update,
  tokenUpdate: tokenUpdate,
  tokenDelete: tokenDelete,
  start: start,
  stop: stop,
  ping: ping,
  wakeup: wakeup
};
