var path = require('path');
var logger = require('./logger.js');
var errors = require('./errors.js');
var remotes = requireRemotes();

var loaded;
var waiting = [];
var pth = path.join(remotes.getUserDataPath(), 'pritunl.json');
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

var load = function() {
  remotes.readFile(pth, function(err, data) {
    loaded = true;

    try {
      data = JSON.parse(data);
    } catch (err) {
      err = new errors.ParseError('config: Failed to parse config (%s)', err);
      logger.error(err);
      data = {};
    }

    settings.showUbuntu = data['show_ubuntu'];
    if (settings.showUbuntu === undefined) {
      settings.showUbuntu = true;
    }

    for (var i = 0; i < waiting.length; i++) {
      waiting[i]();
    }
  });
};

var save = function() {
  remotes.writeFile(pth, JSON.stringify({
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
