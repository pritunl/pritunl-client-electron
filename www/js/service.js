var request = require('request');

var Service = function Service() {
  this.connections = {};
  this.onUpdate = null;
};

Service.prototype.update = function() {
  request.get({
    url: 'http://localhost:9770/status'
  }, function(err, resp, body) {
    this.connections = JSON.parse(body);
    this.onUpdate();
  }.bind(this));
};

Service.prototype.start = function(prfl) {
  request.post({
    url: 'http://localhost:9770/start',
    form: {
      id: prfl.id,
      path: prfl.path
    }
  }, function(err, resp, body) {
    // TODO err
  });
};

Service.prototype.stop = function(prfl) {
  request.post({
    url: 'http://localhost:9770/stop',
    form: {
      id: prfl.id
    }
  }, function(err, resp, body) {
    // TODO err
  });
};

module.exports = {
  Service: Service
};
