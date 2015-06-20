var path = require('path');
var logger = require('./logger.js');

var remote;
try {
  remote = require('remote');
} catch(err) {
}

var fs;
var app;
if (remote) {
  fs = remote.require('fs');
  app = remote.require('app');
} else {
  fs = require('fs');
  app = require('app');
}

var loaded;
var waiting = [];
var pth = path.join(app.getPath('userData'), 'pritunl.json');

var settings = {
  ubuntuClicked: 0
};

var onReady = function(callback) {
  if (loaded) {
    callback();
    return;
  }
  waiting.push(callback);
};

var load = function() {
  fs.readFile(pth, function(err, data) {
    loaded = true;

    try {
      data = JSON.parse(data);
    } catch (err) {
      data = {};
    }

    settings.ubuntuClicked = data['ubuntu_click'] || 0;

    for (var i = 0; i < waiting.length; i++) {
      waiting[i]();
    }
  });
};

var save = function() {
  fs.writeFile(pth, JSON.stringify({
    'ubuntu_click': settings.ubuntuClicked
  }), function(err) {
    if (err !== null) {
      logger.error('Failed to write conf: ' + err);
    }
  });
};

load();

module.exports = {
  settings: settings,
  onReady: onReady,
  save: save
};
