var request = require('request');
var alert = require('./alert.js');
var constants = require('./constants.js');

var profiles = [];
var profilesId = {};

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

var update = function() {
  request.get({
    url: 'http://' + constants.serviceHost + '/profile'
  }, function(err, resp, body) {
    onUpdate(JSON.parse(body));
  }.bind(this));
};

var start = function(prfl) {
  request.post({
    url: 'http://' + constants.serviceHost + '/profile',
    json: true,
    body: {
      id: prfl.id,
      data: prfl.data
    }
  }, function(err) {
    if (err) {
      alert.error('Failed to start profile: ' + err);
    }
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
      alert.error('Failed to stop profile: ' + err);
    }
  });
};

module.exports = {
  add: add,
  remove: remove,
  get: get,
  update: update,
  start: start,
  stop: stop
};
