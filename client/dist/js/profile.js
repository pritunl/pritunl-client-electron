var crypto = require('crypto');
var path = require('path');
var util = require('util');
var os = require('os');
var errors = require('./errors.js');
var utils = require('./utils.js');
var service = require('./service.js');
var logger = require('./logger.js');
var fs = require('fs');
var childProcess = require('child_process');

function Profile(systemPrfl, pth) {
  this.onUpdate = null;

  this.systemPrfl = systemPrfl;
  if (this.systemPrfl) {
    this.id = null;
    this.path = null;
    this.confPath = null;
    this.ovpnPath = null;
    this.logPath = null;
  } else {
    this.id = path.basename(pth);
    this.path = pth;
    this.confPath = pth + '.conf';
    this.ovpnPath = pth + '.ovpn';
    this.logPath = pth + '.log';
  }

  this.data = null;
  this.keyData = null;
  this.name = null;
  this.state = null;
  this.uvName = null;
  this.wg = null;
  this.lastMode = null;
  this.organizationId = null;
  this.organization = null;
  this.serverId = null;
  this.server = null;
  this.userId = null;
  this.user = null;
  this.preConnectMsg = null;
  this.dynamicFirewall = null;
  this.disableGateway = null;
  this.ssoAuth = null;
  this.passwordMode = null;
  this.token = null;
  this.tokenTtl = null;
  this.syncHosts = [];
  this.syncHash = null;
  this.syncSecret = null;
  this.syncToken = null;
  this.serverPublicKey = null;
  this.serverBoxPublicKey = null;
  this.log = null;
}

Profile.prototype.load = function(callback, waitAll) {
  if (this.systemPrfl) {
    throw new Error('Load on system profile');
  }

  var waiter = new utils.WaitGroup();
  waiter.add(3);

  if (os.platform() !== 'win32') {
    fs.stat(this.confPath, function(err, stats) {
      if (err && err.code === 'ENOENT') {
        return;
      }

      var confMode;
      try {
        confMode = (stats.mode & 0o777).toString(8);
      } catch (e) {
        err = new errors.ParseError(
          'profile: Failed to stat config (%s)', e);
        logger.error(err);
        return;
      }

      if (confMode !== '600') {
        fs.chmod(this.confPath, 0o600, function(err) {
          if (err) {
            err = new errors.ParseError(
              'profile: Failed to chmod config (%s)',
              err,
            );
            logger.error(err);
          }
        });
      }
    }.bind(this));
  }

  fs.readFile(this.confPath, function(err, data) {
    var confData;
    try {
      confData = JSON.parse(data);
    } catch (e) {
      err = new errors.ParseError(
        'profile: Failed to parse config (%s)', e);
      logger.error(err);
      confData = {};
    }

    this.import(confData);

    if (waitAll) {
      waiter.done();
    } else if (callback) {
      callback();
    }
  }.bind(this));

  if (os.platform() !== 'win32') {
    fs.stat(this.ovpnPath, function(err, stats) {
      if (err && err.code === 'ENOENT') {
        return;
      }

      var ovpnMode;
      try {
        ovpnMode = (stats.mode & 0o777).toString(8);
      } catch (e) {
        err = new errors.ParseError(
          'profile: Failed to stat profile (%s)', e);
        logger.error(err);
        return;
      }

      if (ovpnMode !== '600') {
        fs.chmod(this.ovpnPath, 0o600, function(err) {
          if (err) {
            err = new errors.ParseError(
              'profile: Failed to chmod profile (%s)',
              err,
            );
            logger.error(err);
          }
        });
      }
    }.bind(this));
  }

  fs.readFile(this.ovpnPath, function(err, data) {
    if (!data) {
      this.data = null;
    } else {
      this.data = data.toString();
    }

    this.parseData();

    if (waitAll) {
      waiter.done();
    }
  }.bind(this));

  if (os.platform() !== 'win32') {
    fs.stat(this.logPath, function(err, stats) {
      if (err && err.code === 'ENOENT') {
        return;
      }

      var logMode;
      try {
        logMode = (stats.mode & 0o777).toString(8);
      } catch (e) {
        err = new errors.ParseError(
          'profile: Failed to stat log (%s)', e);
        logger.error(err);
        return;
      }

      if (logMode !== '600') {
        fs.chmod(this.logPath, 0o600, function(err) {
          if (err) {
            err = new errors.ParseError(
              'profile: Failed to chmod log (%s)',
              err,
            );
            logger.error(err);
          }
        });
      }
    }.bind(this));
  }

  fs.readFile(this.logPath, function(err, data) {
    if (!data) {
      this.log = null;
    } else {
      this.log = data.toString();
    }

    if (waitAll) {
      waiter.done();
    }
  }.bind(this));

  waiter.wait(function() {
    if (callback) {
      callback();
    }
  })
};

Profile.prototype.loadSystem = function(data) {
  this.id = data.id;
  this.name = data.name || this.name;
  this.state = data.state || null;
  this.wg = data.wg || false;
  this.lastMode = data.last_mode || null;
  this.organizationId = data.organization_id || null;
  this.organization = data.organization || null;
  this.serverId = data.server_id || null;
  this.server = data.server || null;
  this.userId = data.user_id || null;
  this.user = data.user || null;
  this.preConnectMsg = data.pre_connect_msg || null;
  this.dynamicFirewall = data.dynamic_firewall || null;
  this.deviceAuth = data.device_auth || null;
  this.disableGateway = data.disable_gateway || null;
  this.ssoAuth = data.sso_auth || null;
  this.passwordMode = data.password_mode || null;
  this.token = data.token || false;
  this.tokenTtl = data.token_ttl || null;
  this.disableReconnect = data.disable_reconnect || null;
  this.syncHosts = data.sync_hosts || [];
  this.syncHash = data.sync_hash || null;
  this.syncSecret = data.sync_secret || null;
  this.syncToken = data.sync_token || null;
  this.serverPublicKey = data.server_public_key || null;
  this.serverBoxPublicKey = data.server_box_public_key || null;

  this.data = data.ovpn_data;
  this.parseData();
};

Profile.prototype.exportSystem = function(callback) {
  this.getFullData(function (data) {
    callback({
      id: this.id,
      name: this.name,
      wg: this.wg,
      last_mode: this.lastMode,
      organization_id: this.organizationId,
      organization: this.organization,
      server_id: this.serverId,
      server: this.server,
      user_id: this.userId,
      user: this.user,
      pre_connect_msg: this.preConnectMsg,
      dynamic_firewall: this.dynamicFirewall,
      device_auth: this.deviceAuth,
      disable_gateway: this.disableGateway,
      sso_auth: this.ssoAuth,
      password_mode: this.passwordMode,
      token: this.token,
      token_ttl: this.tokenTtl,
      disable_reconnect: this.disableReconnect,
      sync_hosts: this.syncHosts,
      sync_hash: this.syncHash,
      sync_secret: this.syncSecret,
      sync_token: this.syncToken,
      server_public_key: this.serverPublicKey,
      server_box_public_key: this.serverBoxPublicKey,
      ovpn_data: data,
    });
  }.bind(this));
};

Profile.prototype.parseData = function() {
  var line;
  var lines = this.data.split('\n');

  this.uvName = null;

  for (var i = 0; i < lines.length; i++) {
    line = lines[i];

    if (line.startsWith('setenv UV_NAME')) {
      line = line.split(' ');
      line.shift();
      line.shift();
      this.uvName = line.join(' ');
      return;
    }
  }
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

Profile.prototype.refresh = function(prfl) {
  this.name = prfl.name || this.name;
  this.state = prfl.state || null;
  this.wg = prfl.wg;
  this.lastMode = prfl.lastMode;
  this.organizationId = prfl.organizationId || this.organizationId;
  this.organization = prfl.organization || this.organization;
  this.serverId = prfl.serverId || this.serverId;
  this.server = prfl.server || this.server;
  this.userId = prfl.userId || this.userId;
  this.user = prfl.user || this.user;
  this.preConnectMsg = prfl.preConnectMsg || this.preConnectMsg;
  this.dynamicFirewall = prfl.dynamicFirewall;
  this.disableGateway = prfl.disableGateway;
  this.ssoAuth = prfl.ssoAuth;
  this.passwordMode = prfl.passwordMode;
  this.token = prfl.token;
  this.tokenTtl = prfl.tokenTtl;
  this.disableReconnect = prfl.disableReconnect;
  this.syncHosts = prfl.syncHosts;
  this.syncHash = prfl.syncHash;
  this.serverPublicKey = prfl.serverPublicKey;
  this.serverBoxPublicKey = prfl.serverBoxPublicKey;

  if (this.onUpdate) {
    this.onUpdate();
  }
};

Profile.prototype.import = function(data) {
  this.status = this.status || 'disconnected';
  this.name = data.name || this.name;
  this.wg = data.wg || false;
  this.lastMode = data.last_mode || this.lastMode;
  this.organizationId = data.organization_id || null;
  this.organization = data.organization || null;
  this.serverId = data.server_id || null;
  this.server = data.server || null;
  this.userId = data.user_id || null;
  this.user = data.user || null;
  this.preConnectMsg = data.pre_connect_msg || null;
  this.dynamicFirewall = data.dynamic_firewall || null;
  this.deviceAuth = data.device_auth || null;
  this.disableGateway = data.disable_gateway || null;
  this.ssoAuth = data.sso_auth || null;
  this.passwordMode = data.password_mode || null;
  this.token = data.token || false;
  this.tokenTtl = data.token_ttl || null;
  this.disableReconnect = data.disable_reconnect || null;
  this.syncHosts = data.sync_hosts || [];
  this.syncHash = data.sync_hash || null;
  this.syncSecret = data.sync_secret || null;
  this.syncToken = data.sync_token || null;
  this.serverPublicKey = data.server_public_key || null;
  this.serverBoxPublicKey = data.server_box_public_key || null;
  this.keyData = data.key_data || this.keyData;
};

Profile.prototype.upsert = function(data) {
  this.name = data.name || this.name;
  this.wg = data.wg || false;
  this.organizationId = data.organization_id || this.organizationId;
  this.organization = data.organization || this.organization;
  this.serverId = data.server_id || this.serverId;
  this.server = data.server || this.server;
  this.userId = data.user_id || this.userId;
  this.user = data.user || this.user;
  this.preConnectMsg = data.pre_connect_msg;
  this.dynamicFirewall = data.dynamic_firewall;
  this.deviceAuth = data.device_auth;
  this.disableGateway = data.disable_gateway;
  this.ssoAuth = data.sso_auth;
  this.passwordMode = data.password_mode;
  this.token = data.token;
  this.tokenTtl = data.token_ttl;
  this.disableReconnect = data.disable_reconnect;
  this.syncHosts = data.sync_hosts;
  this.syncHash = data.sync_hash;
  this.serverPublicKey = data.server_public_key;
  this.serverBoxPublicKey = data.server_box_public_key;
};

Profile.prototype.exportConf = function() {
  return {
    name: this.name,
    wg: this.wg,
    lastMode: this.lastMode,
    organization_id: this.organizationId,
    organization: this.organization,
    server_id: this.serverId,
    server: this.server,
    user_id: this.userId,
    user: this.user,
    pre_connect_msg: this.preConnectMsg,
    dynamic_firewall: this.dynamicFirewall,
    device_auth: this.deviceAuth,
    disable_gateway: this.disableGateway,
    sso_auth: this.ssoAuth,
    password_mode: this.passwordMode,
    token: this.token,
    token_ttl: this.tokenTtl,
    disable_reconnect: this.disableReconnect,
    sync_hosts: this.syncHosts,
    sync_hash: this.syncHash,
    sync_secret: this.syncSecret,
    sync_token: this.syncToken,
    server_public_key: this.serverPublicKey,
    server_box_public_key: this.serverBoxPublicKey,
    key_data: this.keyData
  };
};

Profile.prototype.export = function() {
  var formatedName = this.formatedName();

  var status;
  if (this.status === 'connected') {
    status = this.getUptime();
  } else if (this.status === 'connecting') {
    status = 'Connecting';
  } else if (this.status === 'authenticating') {
    status = 'Authenticating';
  } else if (this.status === 'reconnecting') {
    status = 'Reconnecting';
  } else if (this.status === 'disconnecting') {
    status = 'Disconnecting';
  } else {
    status = 'Disconnected';
  }

  return {
    id: this.id,
    status: status,
    serverAddr: this.serverAddr || '-',
    clientAddr: this.clientAddr || '-',
    name: formatedName,
    wg: this.wg || false,
    lastMode: this.lastMode,
    organizationId: this.organizationId || '',
    organization: this.organization || '',
    serverId: this.serverId || '',
    server: this.server || '',
    userId: this.userId || '',
    user: this.user || '',
    preConnectMsg: this.preConnectMsg || '',
    dynamicFirewall: this.dynamicFirewall  ? 'On' : 'Off',
    disableGateway: this.disableGateway  ? 'On' : 'Off',
    ssoAuth: this.ssoAuth  ? 'On' : 'Off',
    autostart: this.systemPrfl ? 'On' : 'Off',
    syncHosts: this.syncHosts || [],
    syncHash: this.syncHash || '',
    syncSecret: this.syncSecret || '',
    syncToken: this.syncToken || '',
    serverPublicKey: this.serverPublicKey,
    serverBoxPublicKey: this.serverBoxPublicKey
  }
};

Profile.prototype.formatedName = function() {
  var name = this.name;

  if (!name) {
    if (this.user) {
      name = this.user.split('@')[0];

      if (this.server) {
        name += ' (' + this.server + ')';
      }
    } else if (this.server) {
      name = this.server;
    } else if (this.uvName) {
      name = this.uvName;
    } else {
      name = 'Unknown Profile';
    }
  }

  if (this.systemPrfl) {
    name += ' (system)';
  }

  return name;
};

Profile.prototype.pushOutput = function(output) {
  if (this.log) {
    this.log += '\n';
    this.log += output;
  } else {
    this.log = output;
  }

  if (this.onOutput) {
    this.onOutput(output);
  }
};

Profile.prototype.getOutput = function(callback) {
  if (this.systemPrfl) {
    service.sprofileLogGet(this.id, function(err, data) {
      if (err) {
        callback('');
      } else {
        callback(data);
      }
    }.bind(this));
  } else {
    callback(this.log);
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
  if (this.systemPrfl) {
    this.exportSystem(function(data) {
      service.sprofilePut(data);
    }.bind(this));
  } else {
    fs.writeFile(
      this.confPath,
      JSON.stringify(this.exportConf()),
      {mode: 0o600},
      function(err) {
        if (err) {
          err = new errors.WriteError(
            'config: Failed to save profile conf (%s)', err);
          logger.error(err);
        }
        if (this.onUpdate) {
          this.onUpdate();
        }
        if (callback) {
          callback(err);
        }
      }.bind(this)
    );
  }
};

Profile.prototype.saveData = function(callback) {
  if (this.systemPrfl) {
    this.exportSystem(function(data) {
      service.sprofilePut(data);
    }.bind(this));
  } else {
    this.encryptKey(function() {
      fs.writeFile(
        this.ovpnPath,
        this.data,
        {mode: 0o600},
        function(err) {
          if (err) {
            err = new errors.WriteError(
              'config: Failed to save profile data (%s)', err);
            logger.error(err);
          }
          this.parseData();
          if (callback) {
            callback(err);
          }
        }.bind(this)
      );
    }.bind(this));
  }
};

Profile.prototype.saveLog = function(callback) {
  if (this.systemPrfl) {
    this.exportSystem(function(data) {
      service.sprofilePut(data);
    }.bind(this));
  } else {
    fs.writeFile(
      this.logPath,
      this.log,
      {mode: 0o600},
      function (err) {
        if (err) {
          err = new errors.WriteError(
            'config: Failed to save profile log (%s)', err);
          logger.error(err);
        }
        if (callback) {
          callback(err);
        }
      }.bind(this)
    );
  }
};

Profile.prototype.clearLog = function(callback) {
  this.log = '';
  if (this.systemPrfl) {
    service.sprofileLogDel(this.id, function(err) {
      if (callback) {
        callback(err);
      }
    }.bind(this));
  } else {
    fs.writeFile(
      this.logPath,
      '',
      {mode: 0o600},
      function (err) {
        if (err) {
          err = new errors.WriteError(
            'config: Failed to save profile log (%s)', err);
          logger.error(err);
        }
        if (callback) {
          callback(err);
        }
      }.bind(this)
    );
  }
};

Profile.prototype.autostartOn = function(callback) {
  if (this.systemPrfl) {
    callback();
    return;
  }

  this.exportSystem(function(data) {
    service.sprofilePut(data, function(err) {
      if (!err) {
        this.delete();
        this.systemPrfl = true;
        this.path = null;
        this.confPath = null;
        this.ovpnPath = null;
        this.logPath = null;
      }
      callback();
    }.bind(this));
  }.bind(this));
};

Profile.prototype.autostartOff = function(callback) {
  if (!this.systemPrfl) {
    callback();
    return;
  }

  this.path = path.join(utils.getUserDataPath(), 'profiles', this.id);
  this.confPath = this.path + '.conf';
  this.ovpnPath = this.path + '.ovpn';
  this.logPath = this.path + '.log';

  service.sprofileDel(this.id, function(err) {
    if (!err) {
      this.systemPrfl = false;

      this.saveData();
      this.saveConf();
      this.saveLog();
    }

    callback();
  }.bind(this));
};

Profile.prototype.delete = function() {
  this.disconnect();

  if (this.systemPrfl) {
    service.sprofileDel(this.id);
  }

  var confPath = this.confPath;
  var ovpnPath = this.ovpnPath;
  var logPath = this.logPath;

  if (os.platform() === 'darwin') {
    childProcess.exec(
      '/usr/bin/security delete-generic-password -s pritunl -a ' +
      this.id, function() {}.bind(this));
  }

  fs.exists(confPath, function(exists) {
    if (!exists) {
      return;
    }
    fs.unlink(confPath, function(err) {
      if (err) {
        err = new errors.RemoveError(
          'config: Failed to delete profile conf (%s)', err);
        logger.error(err);
      }
    });
  }.bind(this));
  fs.exists(ovpnPath, function(exists) {
    if (!exists) {
      return;
    }
    fs.unlink(ovpnPath, function(err) {
      if (err) {
        err = new errors.RemoveError(
          'config: Failed to delete profile data (%s)', err);
        logger.error(err);
      }
    });
  }.bind(this));
  fs.exists(logPath, function(exists) {
    if (!exists) {
      return;
    }
    fs.unlink(logPath, function(err) {
      if (err) {
        err = new errors.RemoveError(
          'config: Failed to delete profile log (%s)', err);
        logger.error(err);
      }
    });
  }.bind(this));
};

Profile.prototype.encryptKey = function(callback) {
  var sIndex;
  var eIndex;
  var keyData = '';

  sIndex = this.data.indexOf('<tls-auth>');
  eIndex = this.data.indexOf('</tls-auth>\n');
  if (sIndex > 0 &&  eIndex > 0) {
    keyData += this.data.substring(sIndex, eIndex + 12);
    this.data = this.data.substring(0, sIndex) + this.data.substring(
      eIndex + 12, this.data.length);
  }

  sIndex = this.data.indexOf('<tls-crypt>');
  eIndex = this.data.indexOf('</tls-crypt>\n');
  if (sIndex > 0 &&  eIndex > 0) {
    keyData += this.data.substring(sIndex, eIndex + 13);
    this.data = this.data.substring(0, sIndex) + this.data.substring(
      eIndex + 13, this.data.length);
  }

  sIndex = this.data.indexOf('<key>');
  eIndex = this.data.indexOf('</key>\n');
  if (sIndex > 0 &&  eIndex > 0) {
    keyData += this.data.substring(sIndex, eIndex + 7);
    this.data = this.data.substring(0, sIndex) + this.data.substring(
      eIndex + 7, this.data.length);
  }

  if (!keyData) {
    if (Constants.platform === "darwin") {
      childProcess.exec(
        '/usr/bin/security find-generic-password -w -s pritunl -a ' +
        this.id, function(err, stdout, stderr) {
          if (err) {
            err = new errors.ProcessError(
              'profile: Failed to get key from keychain (%s)', stderr);
            logger.error(err);
            callback();
            return;
          }

          stdout = new Buffer(stdout.replace('\n', ''), 'base64').toString();

          utils.encryptString(stdout, function(err, encData) {
            if (encData) {
              this.keyData = encData;
              this.saveConf(function() {
                if (os.platform() === 'darwin') {
                  childProcess.exec(
                    '/usr/bin/security delete-generic-password ' +
                    '-s pritunl -a ' + this.id, function() {}.bind(this));
                }

                callback();
              })
            } else {
              callback();
            }
          }.bind(this));
        }.bind(this));
      return
    } else {
      callback();
    }
    return
  }

  utils.encryptString(keyData, function(err, encData) {
    if (encData) {
      if (encData) {
        this.keyData = encData;
        this.saveConf(function() {
          callback()
        });
      } else {
        callback();
      }
    }
  }.bind(this));
};

Profile.prototype.getFullData = function(callback) {
  if (this.systemPrfl) {
    callback(this.data);
  } else if (this.keyData) {
    utils.decryptString(this.keyData, function(err, decData) {
      if (err) {
        err = new errors.ParseError(
          'profile: Failed to decrypt key (%s)', err);
        logger.error(err);
        return;
      }

      callback(this.data + decData);
    }.bind(this));
  } else if (os.platform() === 'darwin') {
    childProcess.exec(
      '/usr/bin/security find-generic-password -w -s pritunl -a ' +
      this.id, function(err, stdout, stderr) {
        if (err) {
          err = new errors.ProcessError(
            'profile: Failed to get key from keychain (%s)', stderr);
          logger.error(err);
          return;
        }

        stdout = new Buffer(stdout.replace('\n', ''), 'base64').toString();
        callback(this.data + stdout);
      }.bind(this));
  } else {
    callback(this.data);
  }
};

Profile.prototype.getAuthType = function() {
  if (this.passwordMode) {
    return this.passwordMode;
  }

  var n = this.data.indexOf('auth-user-pass');

  if (n !== -1) {
    var authStr = this.data.substring(n, this.data.indexOf('\n', n));
    authStr = authStr.split(' ');
    if (authStr.length > 1 && authStr[1]) {
      return null;
    }

    if (this.user) {
      return 'otp';
    } else {
      return 'username_password';
    }
  } else {
    return null;
  }
};

Profile.prototype.updateSync = function(data) {
  var sIndex;
  var eIndex;
  var tlsAuth = '';
  var tlsCrypt = '';
  var cert = '';
  var key = '';
  var jsonData = '';
  var jsonFound = null;

  var dataLines = this.data.split('\n');
  var line;
  var uvId;
  var uvName;
  for (var i = 0; i < dataLines.length; i++) {
    line = dataLines[i];

    if (line.startsWith('setenv UV_ID ')) {
      uvId = line;
    } else if (line.startsWith('setenv UV_NAME ')) {
      uvName = line;
    }
  }

  dataLines = data.split('\n');
  data = '';
  for (i = 0; i < dataLines.length; i++) {
    line = dataLines[i];

    if (jsonFound === null && line === '#{') {
      jsonFound = true;
    }

    if (jsonFound === true && line.startsWith('#')) {
      if (line === '#}') {
        jsonFound = false;
      }
      jsonData += line.replace('#', '');
    } else {
      if (line.startsWith('setenv UV_ID ')) {
        line = uvId;
      } else if (line.startsWith('setenv UV_NAME ')) {
        line = uvName;
      }

      data += line + '\n';
    }
  }

  var confData;
  try {
    confData = JSON.parse(jsonData);
  } catch (e) {
  }

  if (confData) {
    this.upsert(confData);
    this.saveConf();
  }

  if (this.data.indexOf('key-direction') >= 0 && data.indexOf(
      'key-direction') < 0) {
    tlsAuth += 'key-direction 1\n'
  }

  sIndex = this.data.indexOf('<tls-auth>');
  eIndex = this.data.indexOf('</tls-auth>');
  if (sIndex >= 0 &&  eIndex >= 0) {
    tlsAuth += this.data.substring(sIndex, eIndex + 11) + '\n';
  }

  sIndex = this.data.indexOf('<tls-crypt>');
  eIndex = this.data.indexOf('</tls-crypt>');
  if (sIndex >= 0 && eIndex >= 0) {
    tlsCrypt += this.data.substring(sIndex, eIndex + 12) + '\n';
  }

  sIndex = this.data.indexOf('<cert>');
  eIndex = this.data.indexOf('</cert>');
  if (sIndex >= 0 && eIndex >= 0) {
    cert = this.data.substring(sIndex, eIndex + 7) + '\n';
  }

  sIndex = this.data.indexOf('<key>');
  eIndex = this.data.indexOf('</key>');
  if (sIndex >= 0 && eIndex >= 0) {
    key = this.data.substring(sIndex, eIndex + 6) + '\n';
  }

  this.data = data + tlsAuth + tlsCrypt + cert + key;
  this.saveData();
};

Profile.prototype.sync = function(syncHosts, callback) {
  var pth = util.format('/key/sync/%s/%s/%s/%s',
    this.organizationId,
    this.userId,
    this.serverId,
    this.syncHash
  );
  var host = syncHosts.shift();

  if (!host) {
    if (callback) {
      callback();
    }
    return;
  }

  utils.authRequest('get', host, pth, this.syncToken, this.syncSecret, null,
    function(err, resp, body) {
      if (resp && resp.statusCode === 480) {
        logger.info('profile: Failed to sync conf, no subscription');
      } else if (resp && resp.statusCode === 404) {
        logger.warning('profile: Failed to sync conf, user not found');
      } else if (resp && resp.statusCode === 401) {
        logger.warning('profile: Failed to sync conf, ' +
          'authentication error');
      } else if (resp && resp.statusCode === 200) {
        if (body) {
          try {
            var data = JSON.parse(body);
          } catch (_) {
            if (callback) {
              callback();
            }
            return;
          }

          if (!data.signature || !data.conf) {
            if (callback) {
              callback();
            }
            return;
          }

          var confSignature = crypto.createHmac(
            'sha512', this.syncSecret).update(
            data.conf).digest('base64');

          if (confSignature !== data.signature) {
            logger.warning('profile: Failed to sync conf, ' +
              'signature invalid');

            if (callback) {
              callback();
            }
            return;
          }

          this.updateSync(data.conf);
        }
      } else {
        if (!syncHosts.length) {
          if (resp) {
            logger.warning('profile: Failed to sync config (' +
              resp.statusCode + ')');
          } else {
            logger.warning('profile: Failed to sync config');
          }
        } else {
          this.sync(syncHosts, callback);
          return;
        }
      }

      if (callback) {
        callback();
      }
    }.bind(this));
};

Profile.prototype.connect = function(mode, timeout, authCallback) {
  if (this.syncHosts.length) {
    this.sync(this.syncHosts.slice(0), function() {
      this.auth(mode, timeout, authCallback);
    }.bind(this));
  } else {
    this.auth(mode, timeout, authCallback);
  }
};

Profile.prototype.preConnect = function(callback) {
  if (this.syncHosts.length) {
    this.sync(this.syncHosts.slice(0), function() {
      callback();
    }.bind(this));
  } else {
    callback();
  }
};

Profile.prototype.postConnect = function(mode, timeout,
    authCallback, connCallback) {
  this.auth(mode, timeout, authCallback, connCallback);
};

Profile.prototype.auth = function(mode, timeout, callback, connCallback) {
  var authType = this.getAuthType();

  if (this.token) {
    service.tokenUpdate(this, function(err, valid) {
      if (err) {
        if (callback) {
          callback(null, null);
        }
        return;
      }

      if (valid && authType) {
        authType = authType.split('_');

        if (authType.indexOf('pin') !== -1) {
          authType.splice(authType.indexOf('pin'), 1);
        }
        if (authType.indexOf('duo') !== -1) {
          authType.splice(authType.indexOf('duo'), 1);
        }
        if (authType.indexOf('onelogin') !== -1) {
          authType.splice(authType.indexOf('onelogin'), 1);
        }
        if (authType.indexOf('okta') !== -1) {
          authType.splice(authType.indexOf('okta'), 1);
        }
        if (authType.indexOf('yubikey') !== -1) {
          authType.splice(authType.indexOf('yubikey'), 1);
        }
        if (authType.indexOf('otp') !== -1) {
          authType.splice(authType.indexOf('otp'), 1);
        }

        authType = authType.join('_');
      }

      this._auth(authType, mode, timeout, callback, connCallback);
    }.bind(this));
  } else {
    service.tokenDelete(this);
    this._auth(authType, mode, timeout, callback, connCallback);
  }
};

Profile.prototype._auth = function(authType, mode, timeout,
    callback, connCallback) {

  if (!this.systemPrfl && !this.keyData) {
    logger.info("Profiles: Encrypting profile '" + this.id + "'");

    this.saveData(function() {
      if (!authType) {
        if (callback) {
          callback(null, null);
        }
        service.start(this, mode, timeout, this.serverPublicKey,
          this.serverBoxPublicKey, null, null, connCallback);
      } else if (!callback) {
      } else {
        callback(authType, function(user, pass) {
          service.start(this, mode, timeout, this.serverPublicKey,
            this.serverBoxPublicKey, user || 'pritunl', pass, connCallback);
        }.bind(this));
      }
    }.bind(this));

    return
  }

  if (!authType) {
    if (callback) {
      callback(null, null);
    }
    service.start(this, mode, timeout, this.serverPublicKey,
      this.serverBoxPublicKey, null, null, connCallback);
  } else if (!callback) {
  } else {
    callback(authType, function(user, pass) {
      service.start(this, mode, timeout, this.serverPublicKey,
        this.serverBoxPublicKey, user || 'pritunl', pass, connCallback);
    }.bind(this));
  }
};

Profile.prototype.disconnect = function(callback) {
  service.stop(this, callback);
};

var getProfilesUser = function(callback, waitAll) {
  var root = path.join(utils.getUserDataPath(), 'profiles');

  var _callback = function(err, prfls) {
    if (prfls) {
      prfls = sortProfiles(prfls);
    }

    callback(err, prfls);
  };

  fs.exists(root, function(exists) {
    if (!exists) {
      _callback(null, []);
      return;
    }

    fs.readdir(root, function(err, paths) {
      if (err) {
        _callback(err, null);
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
        _callback(null, []);
        return;
      }

      for (i = 0; i < profilePaths.length; i++) {
        pth = profilePaths[i];

        var prfl = new Profile(false, pth);
        profiles.push(prfl);

        prfl.load(function() {
          loaded += 1;

          if (loaded >= profilePaths.length) {
            _callback(null, profiles);
            return;
          }
        }, waitAll);
      }
    });
  });
};

var getProfilesService = function(callback, waitAll) {
  var _callback = function(err, prfls) {
    if (prfls) {
      prfls = sortProfiles(prfls);
    }

    callback(err, prfls);
  };

  service.sprofilesGet(function(sprfls, err) {
    if (err) {
      return
    }

    var prfl;
    var sprfl;
    var profiles = [];

    if (!sprfls.length) {
      _callback(null, []);
      return;
    }

    for (i = 0; i < sprfls.length; i++) {
      sprfl = sprfls[i];

      prfl = new Profile(true);
      prfl.loadSystem(sprfl);

      profiles.push(prfl);
    }

    _callback(null, profiles);
  });
}

var getProfilesAll = function(callback, waitAll) {
  var profiles = [];

  getProfilesService(function(err, prflsService) {
    if (err) {
      return;
    }

    profiles = prflsService;

    getProfilesUser(function(err, prflsUser) {
      if (err) {
        return;
      }

      profiles = profiles.concat(prflsUser);

      callback(err, profiles);
    }, waitAll);
  }, waitAll);
};

var sortProfiles = function(prfls) {
  var i;
  var j;
  var name;
  var indexes;
  var newPrfls = [];
  var prflsMap = {};

  for (i = 0; i < prfls.length; i++) {
    name = prfls[i].formatedName() || 'ZZZZZZZZ';

    if (!prflsMap[name]) {
      prflsMap[name] = [i];
    } else {
      prflsMap[name].push(i);
    }
  }

  var prflsName = Object.keys(prflsMap);
  prflsName.sort();

  for (i = 0; i < prflsName.length; i++) {
    indexes = prflsMap[prflsName[i]];
    for (j = 0; j < indexes.length; j++) {
      newPrfls.push(prfls[indexes[j]]);
    }
  }

  return newPrfls;
};

module.exports = {
  Profile: Profile,
  getProfilesUser: getProfilesUser,
  getProfilesService: getProfilesService,
  getProfilesAll: getProfilesAll,
  sortProfiles: sortProfiles
};
