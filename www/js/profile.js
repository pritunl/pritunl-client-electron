var childProcess = require('child_process');
var remote = require('remote');
var app = remote.require('app');
var fs = remote.require('fs');

var Profile = function Profile(path) {
  this.path = path;
  this.confPath = path + '.conf';
  this.ovpnPath = path + '.ovpn';
  this.logPath = path + '.log';
  this.state = 'disconnected';
  this.proc = null;
  this.data = null;
  this.name = null;
  this.org_id = null;
  this.organization = null;
  this.server_id = null;
  this.server = null;
  this.user_id = null;
  this.user = null;
  this.autostart = false;
  this.syncHosts = [];
  this.syncHash = null;
  this.syncSecret = null;
  this.syncToken = null;
  this.logs = null;

  this.load();
};

Profile.prototype.load = function() {
  fs.readFile(this.confPath, function(err, data) {
    var confData;
    try {
      confData = JSON.parse(data);
    } catch {
      confData = {};
    }

    this.name = confData.name || null;
    this.org_id = confData.org_id || null;
    this.organization = confData.organization || null;
    this.server_id = confData.server_id || null;
    this.server = confData.server || null;
    this.user_id = confData.user_id || null;
    this.user = confData.user || null;
    this.autostart = confData.autostart || null;
    this.syncHosts = confData.syncHosts || [];
    this.syncHash = confData.syncHash || null;
    this.syncSecret = confData.syncSecret || null;
    this.syncToken = confData.syncToken || null;
  }.bind(this));

  fs.readFile(this.ovpnPath, function(err, data) {
    this.data = data.toString();
  }.bind(this));
};

Profile.prototype.connect = function() {
  this.proc = childProcess.spawn('echo', ['-n', 'connect']);

  this.proc.stdout.on('data', function (data) {
    console.log('stdout: ' + data.toString('utf8'));
  });

  this.proc.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  this.proc.on('close', function (code) {
    console.log('close: ' + code);
  });
};

var getProfiles = function(callback) {
  var root = app.getPath('userData') + '/profiles';

  fs.exists(root, function(exists) {
    if (!exists) {
      callback(null, []);
      return;
    }

    fs.readdir(root, function(err, paths) {

      if (err) {
        callback(err, null);
        return
      }
      paths = paths || [];

      var i;
      var path;
      var pathSplit;
      var profile;
      for (i = 0; i < paths.length; i++) {
        path = paths[i];
        pathSplit = path.split('.');

        if (pathSplit[pathSplit.length - 1] !== 'conf') {
          continue;
        }

        profile = new Profile(root + '/' + path.substr(0, path.length - 5));
      }
    });
  });
};

module.exports = Profile;
