var path = require('path');
var logger = require('./logger.js');
var errors = require('./errors.js');
var utils = require('./utils.js');
var fs = require('fs');

var loaded;
var waiting = [];
var pth = path.join(utils.getUserDataPath(), 'pritunl.json');
var settings = {
  showUbuntu: true
};

var onReady = function(callback) {
  if (loaded) {
    callback();
    return;
  }
  waiting.push(callback);
};

var importData = function(data) {
  loaded = true;

  settings.showUbuntu = data['show_ubuntu'];
  if (settings.showUbuntu === undefined) {
    settings.showUbuntu = true;
  }

  for (var i = 0; i < waiting.length; i++) {
    waiting[i]();
  }
};

var load = function() {
  fs.exists(pth, function(exists) {
    if (!exists) {
      importData({});
      return;
    }

    fs.readFile(pth, function(err, data) {
      if (err) {
        err = new errors.ReadError(
          'config: Failed to read config (%s)', err);
        logger.error(err);
        data = {}
      } else {
        try {
          data = JSON.parse(data);
        } catch (e) {
          err = new errors.ParseError(
            'config: Failed to parse config (%s)', e);
          logger.error(err);
          data = {};
        }
      }

      importData(data);
    });
  });
};

var save = function() {
  fs.writeFile(pth, JSON.stringify({
    'show_ubuntu': settings.showUbuntu
  }), function(err) {
    if (err) {
      err = new errors.WriteError('config: Failed to write config (%s)', err);
      logger.error(err);
    }
  });
};

load();

module.exports = {
  settings: settings,
  onReady: onReady,
  save: save
};
