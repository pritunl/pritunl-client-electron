var path = require('path');
var logger = require('./logger.js');
var errors = require('./errors.js');
var utils = require('./utils.js');
var fs = require('fs');

var loaded;
var waiting = [];
var pth = path.join(utils.getUserDataPath(), 'pritunl.json');
var settings = {
  disable_reconnect: false,
  disable_tray_icon: false,
  classic_interface: false
};

var onReady = function(callback) {
  if (loaded) {
    callback();
    return;
  }
  waiting.push(callback);
};

var importData = function(data, callback) {
  settings.disable_reconnect = !!data['disable_reconnect'];
  settings.disable_tray_icon = !!data['disable_tray_icon'];
  settings.classic_interface = !!data['classic_interface'];

  if (callback) {
    callback();
  } else {
    loaded = true;

    for (var i = 0; i < waiting.length; i++) {
      waiting[i]();
    }
    waiting = [];
  }
};

var load = function(callback) {
  fs.readFile(pth, function(err, data) {
    if (err) {
      if (err.code === 'ENOENT') {
        importData({}, callback);
        return;
      }

      err = new errors.ReadError(
        'config: Failed to read config (%s)', err);
      logger.error(err);
      data = {};
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

    importData(data, callback);
  });
};

var reload = function(callback) {
  if (!callback) {
    throw new Error('Callback required for reload');
  }
  load(callback);
};

var save = function() {
  fs.writeFile(pth, JSON.stringify(settings), function(err) {
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
  reload: reload,
  save: save
};
