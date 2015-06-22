var crypto = require('crypto');
var path = require('path');
var errors = require('./errors.js');
var utils = require('./utils.js');
var service = require('./service.js');
var logger = require('./logger.js');
var remotes = requireRemotes();

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

function Profile(pth) {
  this.onUpdate = null;

  this.id = path.basename(pth);
  this.path = pth;
  this.confPath = pth + '.conf';
  this.ovpnPath = pth + '.ovpn';
  this.logPath = pth + '.log';
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
}

Profile.prototype.load = function(callback) {
  remotes.readFile(this.confPath, function (err, data) {
    var confData;
    try {
      confData = JSON.parse(data);
    } catch (err) {
      err = new errors.ParseError('profile: Failed to parse config (%s)', err);
      logger.error(err);
      confData = {};
    }

    this.import(confData);

    if (callback) {
      callback();
    }
  }.bind(this));

  remotes.readFile(this.ovpnPath, function(err, data) {
    if (!data) {
      this.data = null;
    } else {
      this.data = data.toString();
    }
  }.bind(this));

  remotes.readFile(this.logPath, function(err, data) {
    if (!data) {
      this.log = null;
    } else {
      this.log = data.toString();
    }
  }.bind(this));
};

Profile.prototype.update = function(data) {
  this.status = data['status'];
  this.timestamp = data['timestamp'];
  this.serverAddr = data['server_addr'];
  this.clientAddr = data['client_addr'];

  if (this.onUpdate) {
    this.onUpdate();
  }
};

Profile.prototype.import = function(data) {
  this.status = 'disconnected';
  this.serverAddr = null;
  this.clientAddr = null;
  this.name = data.name || null;
  this.organizationId = data.organization_id || null;
  this.organization = data.organization || null;
  this.serverId = data.server_id || null;
  this.server = data.server || null;
  this.userId = data.user_id || null;
  this.user = data.user || null;
  this.autostart = data.autostart || null;
  this.syncHosts = data.sync_hosts || [];
  this.syncHash = data.sync_hash || null;
  this.syncSecret = data.sync_secret || null;
  this.syncToken = data.sync_token || null;
};

Profile.prototype.exportConf = function() {
  return {
    name: this.name,
    organization_id: this.organizationId,
    organization: this.organization,
    server_id: this.serverId,
    server: this.server,
    user_id: this.userId,
    user: this.user,
    autostart: this.autostart,
    sync_hosts: this.syncHosts,
    sync_hash: this.syncHash,
    sync_secret: this.syncSecret,
    sync_token: this.syncToken
  };
};

Profile.prototype.export = function() {
  var nameLogo = this.formatedNameLogo();

  var hash = crypto.createHash('md5');
  hash.update(nameLogo[0]);
  hash = hash.digest('base64');

  var status;
  if (this.status === 'connected') {
    status = this.getUptime();
  } else if (this.status === 'connecting') {
    status = 'Connecting';
  } else if (this.status === 'reconnecting') {
    status = 'Reconnecting';
  } else {
    status = 'Disconnected';
  }

  return {
    logo: nameLogo[1],
    logoColor: colors[hash.substr(0, 1)],
    status: status,
    serverAddr: this.serverAddr || '-',
    clientAddr: this.clientAddr || '-',
    name: nameLogo[0],
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

Profile.prototype.formatedNameLogo = function() {
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

  return [name, logo];
};

Profile.prototype.pushOutput = function(output) {
  if (this.log) {
    this.log += '\n';
  }
  this.log += output;

  if (this.onOutput) {
    this.onOutput(output);
  }
};

Profile.prototype.getUptime = function(curTime) {
  if (!this.timestamp || this.status !== 'connected') {
    return;
  }

  curTime = curTime || Math.floor((new Date).getTime() / 1000);

  var uptime = curTime - this.timestamp;
  var units;
  var unitStr;
  var uptimeItems = [];

  if (uptime > 86400) {
    units = Math.floor(uptime / 86400);
    uptime -= units * 86400;
    unitStr = units + ' day';
    if (units > 1) {
      unitStr += 's';
    }
    uptimeItems.push(unitStr);
  }

  if (uptime > 3600) {
    units = Math.floor(uptime / 3600);
    uptime -= units * 3600;
    unitStr = units + ' hour';
    if (units > 1) {
      unitStr += 's';
    }
    uptimeItems.push(unitStr);
  }

  if (uptime > 60) {
    units = Math.floor(uptime / 60);
    uptime -= units * 60;
    unitStr = units + ' min';
    if (units > 1) {
      unitStr += 's';
    }
    uptimeItems.push(unitStr);
  }

  if (uptime) {
    unitStr = uptime + ' sec';
    if (uptime > 1) {
      unitStr += 's';
    }
    uptimeItems.push(unitStr);
  }

  return uptimeItems.join(' ');
};

Profile.prototype.saveConf = function(callback) {
  remotes.writeFile(this.confPath,
    JSON.stringify(this.exportConf()), function(err) {
      if (err) {
        err = new errors.WriteError(
          'config: Failed to save profile conf (%s)', err);
        logger.error(err);
      }
      if (callback) {
        callback(err);
      }
    });
};

Profile.prototype.saveData = function(callback) {
  remotes.writeFile(this.ovpnPath, this.data, function(err) {
    if (err) {
      err = new errors.WriteError(
        'config: Failed to save profile data (%s)', err);
      logger.error(err);
    }
    if (callback) {
      callback(err);
    }
  });
};

Profile.prototype.saveLog = function(callback) {
  remotes.writeFile(this.logPath, this.log, function(err) {
    if (err) {
      err = new errors.WriteError(
        'config: Failed to save profile log (%s)', err);
      logger.error(err);
    }
    if (callback) {
      callback(err);
    }
  });
};

Profile.prototype.delete = function() {
  this.disconnect();

  remotes.exists(this.confPath, function(exists) {
    if (!exists) {
      return;
    }
    remotes.unlink(this.confPath, function(err) {
      if (err) {
        err = new errors.RemoveError(
          'config: Failed to delete profile conf (%s)', err);
        logger.error(err);
      }
    });
  }.bind(this));
  remotes.exists(this.ovpnPath, function(exists) {
    if (!exists) {
      return;
    }
    remotes.unlink(this.ovpnPath, function(err) {
      if (err) {
        err = new errors.RemoveError(
          'config: Failed to delete profile data (%s)', err);
        logger.error(err);
      }
    });
  }.bind(this));
  remotes.exists(this.logPath, function(exists) {
    if (!exists) {
      return;
    }
    remotes.unlink(this.logPath, function(err) {
      if (err) {
        err = new errors.RemoveError(
          'config: Failed to delete profile log (%s)', err);
        logger.error(err);
      }
    });
  }.bind(this));
};

Profile.prototype.connect = function() {
  service.start(this);
};

Profile.prototype.disconnect = function() {
  service.stop(this);
};

var getProfiles = function(callback) {
  var root = path.join(remotes.getUserDataPath(), 'profiles');

  remotes.exists(root, function(exists) {
    if (!exists) {
      callback(null, []);
      return;
    }

    remotes.readdir(root, function(err, paths) {
      if (err) {
        callback(err, null);
        return
      }
      paths = paths || [];

      var i;
      var loaded = 0;
      var pth;
      var pathSplit;
      var profilePaths = [];
      var profiles = [];

      for (i = 0; i < paths.length; i++) {
        pth = paths[i];
        pathSplit = pth.split('.');

        if (pathSplit[pathSplit.length - 1] !== 'conf') {
          continue;
        }

        profilePaths.push(root + '/' + pth.substr(0, pth.length - 5));
      }

      if (!profilePaths.length) {
        callback(null, []);
      }

      for (i = 0; i < profilePaths.length; i++) {
        pth = profilePaths[i];

        var prfl = new Profile(pth);
        profiles.push(prfl);

        prfl.load(function() {
          loaded += 1;

          if (loaded >= profilePaths.length) {
            callback(null, profiles);
          }
        });
      }
    });
  });
};

var importProfile = function(pth, callback) {
  var ext = path.extname(pth);

  var fsCallback = function(err, data) {
    if (err) {
      callback(err);
      return;
    }

    data = data.replace('\r', '');
    var line;
    var lines = data.split('\n');
    var jsonFound = null;
    var jsonData = '';
    var ovpnData = '';

    for (var i = 0; i < lines.length; i++) {
      line = lines[i];

      if (jsonFound === null && line === '#{') {
        jsonFound = true;
      }

      if (jsonFound === true) {
        if (line === '#}') {
          jsonFound = false;
        }
        jsonData += line.replace('#', '');
      } else {
        ovpnData += line + '\n';
      }
    }

    var confData;
    try {
      confData = JSON.parse(jsonData);
    } catch (err) {
      confData = {};
    }

    data = ovpnData.trim() + '\n';

    pth = path.join(remotes.getUserDataPath(), 'profiles', utils.uuid());
    var prfl = new Profile(pth);

    prfl.import(confData);
    prfl.data = data;

    prfl.saveData();
    prfl.saveConf();

    callback(null, prfl);
  };

  switch (ext) {
    case '.ovpn':
    case '.conf':
      remotes.readFile(pth, 'utf8', fsCallback);
      break;
    case '.tar':
      remotes.readTarFile(pth, fsCallback);
      break;
    default:
      var err = new errors.UnsupportedError('profile: Unsupported file type');
      logger.error(err);
      callback(err);
  }
};

module.exports = {
  Profile: Profile,
  importProfile: importProfile,
  getProfiles: getProfiles
};
