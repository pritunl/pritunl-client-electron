var crypto = require('crypto');
var path = require('path');
var request = require('request');
var constants = require('./constants.js');
var errors = require('./errors.js');
var utils = require('./utils.js');
var service = require('./service.js');
var logger = require('./logger.js');
var profile = require('./profile.js');
var fs = require('fs');
var archive = require('./archive.js');

function Importer() {
  this.files = {};
  this.profiles = [];
  this.readWaiter = new utils.WaitGroup();
}

Importer.prototype.addData = function(pth, data) {
  this.files[pth] = data;
};

Importer.prototype.addPath = function(pth) {
  this.readWaiter.add();
  fs.readFile(pth, 'utf8', function(err, data) {
    if (err) {
      err = new errors.ReadError(
        'importer: Failed to read profile (%s)', err);
      logger.error(err);
      return;
    }

    this.files[pth] = data;
    this.readWaiter.done();
  }.bind(this));
};

Importer.prototype.import = function(pth, data, callback) {
  data = data.replace(/\r/g, '');
  var line;
  var lines = data.split('\n');
  var jsonFound = null;
  var jsonData = '';
  var ovpnData = '';
  var keyData = '';
  var filePth;
  var split;
  var waiter = new utils.WaitGroup();
  var fileName = path.basename(pth);
  fileName = fileName.split('.');
  fileName.pop();
  fileName = fileName.join('.');

  for (var i = 0; i < lines.length; i++) {
    line = lines[i];

    if (jsonFound === null && line === '#{') {
      jsonFound = true;
    }

    if (jsonFound === true && line.startsWith('#')) {
      if (line === '#}') {
        jsonFound = false;
      }
      jsonData += line.replace('#', '');
    } else if (line.startsWith('ca ')) {
      split = line.split(' ');
      split.shift();
      filePth = split.join(' ');

      if (this.files[filePth]) {
        keyData += '<ca>\n' + this.files[filePth] + '</ca>\n';
      } else {
        filePth = path.join(path.dirname(pth), path.normalize(filePth));
        waiter.add();

        fs.readFile(filePth, 'utf8', function(err, data) {
          if (err) {
            err = new errors.ReadError(
              'importer: Failed to read profile ca cert (%s)', err);
            logger.error(err);
            return;
          }

          keyData += '<ca>\n' + data + '</ca>\n';
          waiter.done();
        }.bind(this));
      }
    } else if (line.startsWith('cert ')) {
      split = line.split(' ');
      split.shift();
      filePth = split.join(' ');

      if (this.files[filePth]) {
        keyData += '<cert>\n' + this.files[filePth] + '</cert>\n';
      } else {
        filePth = path.join(path.dirname(pth), path.normalize(filePth));
        waiter.add();

        fs.readFile(filePth, 'utf8', function(err, data) {
          if (err) {
            err = new errors.ReadError(
              'importer: Failed to read profile user cert (%s)', err);
            logger.error(err);
            return;
          }

          keyData += '<cert>\n' + data + '</cert>\n';
          waiter.done();
        }.bind(this));
      }
    } else if (line.startsWith('key ')) {
      split = line.split(' ');
      split.shift();
      filePth = split.join(' ');

      if (this.files[filePth]) {
        keyData += '<key>\n' + this.files[filePth] + '</key>\n';
      } else {
        filePth = path.join(path.dirname(pth), path.normalize(filePth));
        waiter.add();

        fs.readFile(filePth, 'utf8', function(err, data) {
          if (err) {
            err = new errors.ReadError(
              'importer: Failed to read profile user key (%s)', err);
            logger.error(err);
            return;
          }

          keyData += '<key>\n' + data + '</key>\n';
          waiter.done();
        }.bind(this));
      }
    } else if (line.startsWith('tls-auth ')) {
      split = line.split(' ');
      split.shift();

      if (!isNaN(split[split.length - 1])) {
        keyData += 'key-direction ' + split.pop() + '\n';
      }

      filePth = split.join(' ');

      if (this.files[filePth]) {
        keyData += '<tls-auth>\n' + this.files[filePth] + '</tls-auth>\n';
      } else {
        filePth = path.join(path.dirname(pth), path.normalize(filePth));
        waiter.add();

        fs.readFile(filePth, 'utf8', function(err, data) {
          if (err) {
            err = new errors.ReadError(
              'importer: Failed to read profile tls auth key (%s)', err);
            logger.error(err);
            return;
          }

          keyData += '<tls-auth>\n' + data + '</tls-auth>\n';
          waiter.done();
        }.bind(this));
      }
    } else if (line.startsWith('tls-crypt ')) {
      split = line.split(' ');
      split.shift();

      filePth = split.join(' ');

      if (this.files[filePth]) {
        keyData += '<tls-crypt>\n' + this.files[filePth] + '</tls-crypt>\n';
      } else {
        filePth = path.join(path.dirname(pth), path.normalize(filePth));
        waiter.add();

        fs.readFile(filePth, 'utf8', function(err, data) {
          if (err) {
            err = new errors.ReadError(
                'importer: Failed to read profile tls crypt key (%s)', err);
            logger.error(err);
            return;
          }

          keyData += '<tls-crypt>\n' + data + '</tls-crypt>\n';
          waiter.done();
        }.bind(this));
      }

    } else {
      ovpnData += line + '\n';
    }
  }

  var confData;
  try {
    confData = JSON.parse(jsonData);
  } catch (e) {
  }

  waiter.wait(function() {
    profile.getProfilesAll(function(err, curProfiles) {
      if (err) {
        err = new errors.ReadError(
          'importer: Failed to read profiles (%s)', err);
        logger.error(err);
        return;
      }

      data = ovpnData.trim() + '\n' + keyData;

      var pth = path.join(utils.getUserDataPath(), 'profiles', utils.uuid());
      var prfl = new profile.Profile(false, pth);

      if (confData) {
        prfl.import(confData);
      } else {
        prfl.name = fileName;
      }
      prfl.data = data;

      var exists = false;
      var curPrfl;
      for (var i = 0; i < curProfiles.length; i++) {
        curPrfl = curProfiles[i];

        if (prfl.organizationId && prfl.serverId && prfl.userId &&
            prfl.organizationId === curPrfl.organizationId &&
            prfl.serverId === curPrfl.serverId &&
            prfl.userId === curPrfl.userId) {

          curPrfl.import(confData);
          curPrfl.data = data;

          curPrfl.saveData();
          curPrfl.saveConf();

          exists = true;

          break;
        }
      }

      if (!exists) {
        prfl.saveData();
        prfl.saveConf();

        this.profiles.push(prfl);
      }

      if (callback) {
        callback();
      }
    }.bind(this), true);
  }.bind(this));
};

Importer.prototype.parse = function(callback) {
  this.readWaiter.wait(function() {
    var ext;
    var data;
    var waiter = new utils.WaitGroup();

    for (var pth in this.files) {
      ext = path.extname(pth);
      data = this.files[pth];

      if (ext !== '.ovpn' && ext !== '.conf') {
        continue;
      }

      waiter.add();
      this.import(pth, data, function() {
        waiter.done();
      });
    }

    waiter.wait(function() {
      if (callback) {
        callback(profile.sortProfiles(this.profiles));
      }
    }.bind(this));
  }.bind(this));
};

var importProfile = function(pth, callback) {
  var ext = path.extname(pth);

  var imptr = new Importer();

  switch (ext) {
    case '.ovpn':
    case '.conf':
      imptr.addPath(pth);
      imptr.parse(function(prfls) {
        if (callback) {
          callback(prfls);
        }
      });
      break;
    case '.tar':
      archive.readTarFile(pth, function(err, pth, data) {
        imptr.addData(pth, data);
      }, function() {
        imptr.parse(function(prfls) {
          if (callback) {
            callback(prfls);
          }
        });
      });
      break;
    default:
      var err = new errors.UnsupportedError(
        'profile: Unsupported file type');
      logger.error(err);
  }
};

var importProfileUri = function(prflUri, callback) {
  if (!prflUri) {
    if (callback) {
      callback();
    }
    return;
  }

  if (prflUri.startsWith('pritunl:')) {
    prflUri = prflUri.replace('pritunl:', 'https:');
  } else if (prflUri.startsWith('pts:')) {
    prflUri = prflUri.replace('pts:', 'https:');
  } else if (prflUri.startsWith('http:')) {
    prflUri = prflUri.replace('http:', 'https');
  } else if (prflUri.startsWith('https:')) {
  } else {
    prflUri = 'https://' + prflUri;
  }

  prflUri = prflUri.replace('/k/', '/ku/');

  var importAll = function(prfls) {
    var imptr = new Importer();

    for (var name in prfls) {
      imptr.addData(name, prfls[name]);
    }

    imptr.parse(function(prfls) {
      if (callback) {
        callback(prfls);
      }
    });
  };

  var strictSsl = !prflUri.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/) &&
    !prflUri.match(/\[[a-fA-F0-9:]*\]/);

  request.get({
    url: prflUri,
    strictSSL: strictSsl,
    timeout: 12000,
    headers: {
      'User-Agent': 'pritunl'
    }
  }, function(err, resp, body) {
    var data;

    if (!err && resp && resp.statusCode !== 200) {
      err = resp.statusMessage;
    }

    if (err) {
      err = new errors.ParseError(
        'profile: Failed to load profile uri (%s)', err);
      logger.error(err);
      if (callback) {
        callback();
      }
      return;
    }

    if (resp.statusCode === 404) {
      err = new errors.ParseError('profile: Invalid profile uri');
      logger.error(err);
      if (callback) {
        callback();
      }
      return;
    }

    if (resp.statusCode !== 200) {
      err = new errors.ParseError(
        'profile: Failed to load profile uri (%s)', resp.statusCode);
      logger.error(err);
      if (callback) {
        callback();
      }
      return;
    }

    try {
      data = JSON.parse(body);
    } catch (e) {
      err = new errors.ParseError(
        'profile: Failed to parse profile uri (%s)', e);
      logger.error(err);
      if (callback) {
        callback();
      }
      return;
    }

    importAll(data, callback);
  });
};

module.exports = {
  Importer: Importer,
  importProfile: importProfile,
  importProfileUri: importProfileUri
};
