var request = require('request');
var constants = require('./constants.js');
var logger = require('./logger.js');

var profiles = [];
var profilesId = {};

function NetworkError() {
  ErrorInit.call(this, 'NetworkError', arguments);
}
NetworkError.prototype = new Error;

function ParseError() {
  ErrorInit.call(this, 'ParseError', arguments);
}
ParseError.prototype = new Error;

var onUpdate = function(data) {
  for (var id in data) {
    var prfl = get(id);
    if (prfl) {
      prfl.update(data[id]);
    }
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

var update = function() {
  request.get({
    url: 'http://' + constants.serviceHost + '/profile'
  }, function(err, resp, body) {
    if (err) {
      err = new NetworkError('service: Failed to update profile (%s)', err);
      logger.error(err);
      return;
    }

    try {
      var data = JSON.parse(body);
    } catch (err) {
      err = new ParseError('service: Failed to parse data (%s)', err);
      logger.error(err);
      return;
    }

    onUpdate(data);
  }.bind(this));
};

var start = function(prfl, callback) {
  request.post({
    url: 'http://' + constants.serviceHost + '/profile',
    json: true,
    body: {
      id: prfl.id,
      data: prfl.data
    }
  }, function(err) {
    if (err) {
      err = new NetworkError('service: Failed to start profile (%s)', err);
      logger.error(err);
    }
    callback(err);
  });
};

var stop = function(prfl) {
  request.del({
    url: 'http://' + constants.serviceHost + '/profile',
    json: true,
    body: {
      id: prfl.id
    }
  }, function(err) {
    if (err) {
      err = new NetworkError('service: Failed to stop profile (%s)', err);
      logger.error(err);
    }
    callback(err);
  });
};

module.exports = {
  add: add,
  remove: remove,
  get: get,
  iter: iter,
  update: update,
  start: start,
  stop: stop
};
