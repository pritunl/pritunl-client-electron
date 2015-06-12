var crypto = require('crypto');
var remote = require('remote');
var path = require('path');
var app = remote.require('app');
var fs = remote.require('fs');

var colors = {
  'A': '#ff8a80',
  'B': '#ff5252',
  'C': '#ff1744',
  'D': '#d50000',
  'E': '#ff80ab',
  'F': '#ff4081',
  'G': '#f50057',
  'H': '#c51162',
  'I': '#ea80fc',
  'J': '#e040fb',
  'K': '#d500f9',
  'L': '#aa00ff',
  'M': '#b388ff',
  'N': '#7c4dff',
  'O': '#651fff',
  'P': '#6200ea',
  'Q': '#8c9eff',
  'R': '#536dfe',
  'S': '#3d5afe',
  'T': '#304ffe',
  'U': '#82b1ff',
  'V': '#448aff',
  'W': '#2979ff',
  'X': '#2962ff',
  'Y': '#80d8ff',
  'Z': '#40c4ff',
  'a': '#00b0ff',
  'b': '#0091ea',
  'c': '#84ffff',
  'd': '#18ffff',
  'e': '#00e5ff',
  'f': '#00b8d4',
  'g': '#a7ffeb',
  'h': '#64ffda',
  'i': '#1de9b6',
  'j': '#00bfa5',
  'k': '#b9f6ca',
  'l': '#69f0ae',
  'm': '#00e676',
  'n': '#00c853',
  'o': '#ccff90',
  'p': '#b2ff59',
  'q': '#76ff03',
  'r': '#64dd17',
  's': '#ffff8d',
  't': '#ffff00',
  'u': '#ffea00',
  'v': '#ffd600',
  'w': '#ffd180',
  'x': '#ffab40',
  'y': '#ff9100',
  'z': '#ff6d00',
  '0': '#ff9e80',
  '1': '#ff6e40',
  '2': '#ff3d00',
  '3': '#dd2c00',
  '4': '#d7ccc8',
  '5': '#bcaaa4',
  '6': '#8d6e63',
  '7': '#5d4037',
  '8': '#cfd8dc',
  '9': '#b0bec5',
  '+': '#78909c',
  '/': '#37474f'
};

var Profile = function Profile(serv, pth) {
  this.service = serv;
  this.onUpdate = null;

  this.id = path.basename(pth);
  this.path = pth;
  this.confPath = pth + '.conf';
  this.ovpnPath = pth + '.ovpn';
  this.logPath = pth + '.log';
  this.proc = null;
  this.data = null;
  this.name = null;
  this.organizationId = null;
  this.organization = null;
  this.serverId = null;
  this.server = null;
  this.userId = null;
  this.user = null;
  this.autostart = false;
  this.syncHosts = [];
  this.syncHash = null;
  this.syncSecret = null;
  this.syncToken = null;
  this.log = null;

  this.load();
};

Profile.prototype.load = function() {
  fs.readFile(this.confPath, function (err, data) {
    var confData;
    try {
      confData = JSON.parse(data);
    } catch (err) {
      confData = {};
    }

    this.name = confData.name || null;
    this.organizationId = confData.organizationId || null;
    this.organization = confData.organization || null;
    this.serverId = confData.server_id || null;
    this.server = confData.server || null;
    this.userId = confData.user_id || null;
    this.user = confData.user || null;
    this.autostart = confData.autostart || null;
    this.syncHosts = confData.sync_hosts || [];
    this.syncHash = confData.sync_hash || null;
    this.syncSecret = confData.sync_secret || null;
    this.syncToken = confData.sync_token || null;
  }.bind(this));

  fs.readFile(this.ovpnPath, function(err, data) {
    if (!data) {
      this.data = null;
    } else {
      this.data = data.toString();
    }
  }.bind(this));

  fs.readFile(this.logPath, function(err, data) {
    if (!data) {
      this.log = null;
    } else {
      this.log = data.toString();
    }
  }.bind(this));
};

Profile.prototype.export = function() {
  var logo;
  var name = this.name;

  if (!name) {
    if (this.user) {
      name = this.user;
      if (this.organization) {
        name += '@' + this.organization;
      }

      if (this.server) {
        name += ' (' + this.server + ')';
        logo = this.server.substr(0, 1);
      }
    } else if (this.server) {
      name = this.server;
      logo = this.server.substr(0, 1);
    } else {
      name = 'Unknown Profile';
      logo = 'U';
    }
  }

  var hash = crypto.createHash('md5');
  hash.update(name);
  hash = hash.digest('base64');

  var conn = this.service.connections[this.id];
  var uptime;
  var serverAddr;
  var clientAddr;

  if (!conn) {
    uptime = 'Disconnected';
    serverAddr = '-';
    clientAddr = '-';
  } else {
    var status = conn['status'];

    if (status === 'connected') {
      uptime = null;
    } else if (status === 'connecting') {
      uptime = 'Connecting';
    } else if (status === 'reconnecting') {
      uptime = 'Reconnecting';
    } else {
      uptime = 'Disconnected';
    }

    serverAddr = conn['server_addr'] || '-';
    clientAddr = conn['client_addr'] || '-';
  }

  return {
    logo: logo,
    logoColor: colors[hash.substr(0, 1)],
    uptime: uptime,
    serverAddr: serverAddr,
    clientAddr: clientAddr,
    name: name,
    organizationId: this.organizationId || '',
    organization: this.organization || '',
    serverId: this.serverId || '',
    server: this.server || '',
    userId: this.userId || '',
    user: this.user || '',
    autostart: this.autostart || '',
    syncHosts: this.syncHosts|| [],
    syncHash: this.syncHash || '',
    syncSecret: this.syncSecret || '',
    syncToken: this.syncToken || ''
  }
};

Profile.prototype.saveData = function(callback) {
  fs.writeFile(this.ovpnPath, this.data, callback);
};

Profile.prototype.saveLog = function(callback) {
  fs.writeFile(this.logPath, this.log, callback);
};

Profile.prototype.connect = function() {
  this.service.start(this);
};

Profile.prototype.disconnect = function() {
  this.service.stop(this);
};

var getProfiles = function(serv, callback) {
  var root = path.join(app.getPath('userData'), 'profiles');

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
      var profiles = [];
      for (i = 0; i < paths.length; i++) {
        path = paths[i];
        pathSplit = path.split('.');

        if (pathSplit[pathSplit.length - 1] !== 'conf') {
          continue;
        }

        path = root + '/' + path.substr(0, path.length - 5);

        profiles.push(new Profile(serv, path));
      }

      callback(err, profiles);
    });
  });
};

module.exports = {
  Profile: Profile,
  getProfiles: getProfiles
};
