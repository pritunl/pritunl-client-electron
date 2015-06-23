var crypto = require('crypto');
var path = require('path');
var request = require('request');
var errors = require('./errors.js');
var utils = require('./utils.js');
var service = require('./service.js');
var logger = require('./logger.js');
var profile = require('./profile.js');
var fs = remoteRequire('fs');
var archive = remoteRequire('./archive.js');

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

Importer.prototype.read = function(pth, data, callback) {
  data = data.replace('\r', '');
  var line;
  var lines = data.split('\n');
  var jsonFound = null;
  var jsonData = '';
  var ovpnData = '';
  var keyData = '';
  var filePth;
  var split;
  var waiter = new utils.WaitGroup();

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
        keyData += '<ca>\n' + this.files[filePth] + '</ca>';
      } else {
        filePth = path.join(path.dirname(pth), filePth);
        waiter.add();

        fs.readFile(filePth, 'utf8', function(err, data) {
          if (err) {
            err = new errors.ReadError(
              'importer: Failed to read profile ca cert (%s)', err);
            logger.error(err);
            return;
          }

          keyData += '<ca>\n' + data + '</ca>';
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
        filePth = path.join(path.dirname(pth), filePth);
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
        filePth = path.join(path.dirname(pth), filePth);
        waiter.add();

        fs.readFile(filePth, 'utf8', function(err, data) {
          if (err) {
            err = new errors.ReadError(
              'importer: Failed to read profile ca cert (%s)', err);
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
        filePth = path.join(path.dirname(pth), filePth);
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
    } else {
      ovpnData += line + '\n';
    }
  }

  var confData;
  try {
    confData = JSON.parse(jsonData);
  } catch (e) {
    confData = {};
  }

  waiter.wait(function() {
    data = ovpnData.trim() + '\n' + keyData;

    var pth = path.join(utils.getUserDataPath(), 'profiles', utils.uuid());
    var prfl = new profile.Profile(pth);

    prfl.import(confData);
    prfl.data = data;

    prfl.saveData();
    prfl.saveConf();

    this.profiles.push(prfl);

    if (callback) {
      callback();
    }
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
      this.read(pth, data, function() {
        waiter.done();
      });
    }

    waiter.wait(function(prfl) {
      if (callback) {
        callback(this.profiles);
      }
    }.bind(this));
  }.bind(this));
};

var importProfileData = function(data) {
  data = data.replace('\r', '');
  var line;
  var lines = data.split('\n');
  var jsonFound = null;
  var jsonData = '';
  var ovpnData = '';
  var pth;

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
  } catch (e) {
    confData = {};
  }

  data = ovpnData.trim() + '\n';

  var pth = path.join(utils.getUserDataPath(), 'profiles', utils.uuid());
  var prfl = new Profile(pth);

  prfl.import(confData);
  prfl.data = data;

  prfl.saveData();
  prfl.saveConf();

  return prfl;
};

var importProfile = function(pth, callback) {
  var ext = path.extname(pth);

  switch (ext) {
    case '.ovpn':
    case '.conf':
      fs.readFile(pth, 'utf8', function(err, data) {
        var prfl;

        if (err) {
          err = new errors.ReadError(
            'profile: Failed to read profile (%s)', err);
          logger.error(err);
        } else {
          prfl = importProfileData(data);
        }

        if (callback) {
          callback(err, prfl);
        }
      });
      break;
    case '.tar':
      archive.readTarFile(pth, function(err, data) {
        var prfl;

        if (err) {
          err = new errors.ReadError(
            'profile: Failed to read profile archive (%s)', err);
          logger.error(err);
        } else {
          prfl = importProfileData(data);
        }

        if (callback) {
          callback(err, prfl);
        }
      });
      break;
    default:
      var err = new errors.UnsupportedError('profile: Unsupported file type');
      logger.error(err);
      if (callback) {
        callback(err);
      }
  }
};

var importProfiles = function(prfls, callback) {
  var prfl;

  for (var name in prfls) {
    prfl = importProfileData(prfls[name]);
    if (callback) {
      callback(null, prfl);
    }
  }
};

var importProfileUri = function(prflUri, callback) {
  if (prflUri.startsWith('pritunl:')) {
    prflUri = prflUri.replace('pritunl', 'https');
  } else if (prflUri.startsWith('pts:') || prflUri.startsWith('pt:')) {
    prflUri = prflUri.replace('pt', 'http');
  } else if (prflUri.startsWith('https:') || prflUri.startsWith('http:')) {
  } else {
    prflUri = 'https://' + prflUri;
  }

  prflUri = prflUri.replace('/k/', '/ku/');

  request.get({
    url: prflUri,
    strictSSL: false
  }, function(err, resp, body) {
    var data;

    if (!err) {
      try {
        data = JSON.parse(body);
      } catch (e) {
        err = e;
      }

      if (!err) {
        importProfiles(data, callback);
        return;
      }
    }

    if (prflUri.startsWith('https:')) {
      prflUri = prflUri.replace('https', 'http');
    } else {
      prflUri = prflUri.replace('http', 'https');
    }

    request.get({
      url: prflUri,
      strictSSL: false
    }, function(err, resp, body) {
      var data;

      if (err) {
        err = new errors.ParseError(
          'profile: Failed to load profile uri (%s)', err);
        logger.error(err);
      } else {
        try {
          data = JSON.parse(body);
        } catch (e) {
          err = new errors.ParseError(
            'profile: Failed to parse profile uri (%s)', e);
          logger.error(err);
        }

        if (!err) {
          importProfiles(data, callback);
          return;
        }
      }

      if (callback) {
        callback(err);
      }
    });
  });
};


module.exports = {
  Importer: Importer,
  importProfile: importProfile,
  importProfileUri: importProfileUri
};
