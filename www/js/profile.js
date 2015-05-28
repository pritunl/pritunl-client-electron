var childProcess = require('child_process');

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

  this.load();
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

module.exports = Profile;
