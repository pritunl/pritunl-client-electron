require('./js/globals.js');

var app = require('app');
var path = require('path');
var fs = require('fs');
var request = require('request');
var dialog = require('dialog');
var BrowserWindow = require('browser-window');
var Tray = require('tray');
var Menu = require('menu');
var constants = require('./js/constants.js');
var events = require('./js/events.js');
var profile = require('./js/profile.js');
var service = require('./js/service.js');
var errors = require('./js/errors.js');
var logger = require('./js/logger.js');

var main = null;
var tray = null;

if (app.dock) {
  app.dock.hide();
}

var connTray;
var disconnTray;
if (process.platform === 'darwin') {
  connTray = path.join(__dirname, 'img',
    'tray_connected_osxTemplate.png');
  disconnTray = path.join(__dirname, 'img',
    'tray_disconnected_osxTemplate.png');
} else if (process.platform === 'win32') {
  connTray = path.join(__dirname, 'img',
    'tray_connected_win.png');
  disconnTray = path.join(__dirname, 'img',
    'tray_disconnected_win.png');
} else if (process.platform === 'linux') {
  connTray = path.join(__dirname, 'img',
    'tray_connected_linux_light.png');
  disconnTray = path.join(__dirname, 'img',
    'tray_disconnected_linux_light.png');
} else {
  connTray = path.join(__dirname, 'img',
    'tray_connected.png');
  disconnTray = path.join(__dirname, 'img',
    'tray_disconnected.png');
}
var icon = path.join(__dirname, 'img', 'logo.png');

var checkService = function(callback) {
  service.ping(function(status) {
    if (!status) {
      var timeout;

      if (callback) {
        timeout = 1000;
      } else {
        timeout = 8000;
      }

      setTimeout(function() {
        service.ping(function(status) {
          if (!status) {
            tray.setImage(disconnTray);
            dialog.showMessageBox(null, {
              type: 'warning',
              buttons: ['Ok'],
              icon: icon,
              title: 'Pritunl - Service Error',
              message: 'Unable to communicate with helper service, ' +
                'try restarting'
            });
          }

          if (callback) {
            callback(status);
          }
        });
      }, timeout);
    } else {
      if (callback) {
        callback(true);
      }
    }
  });
};

app.on('window-all-closed', function() {
  if (app.dock) {
    app.dock.hide();
  }
  checkService();
});

var openMainWin = function() {
  if (main) {
    main.focus();
    return;
  }

  checkService(function(status) {
    if (!status) {
      return;
    }

    main = new BrowserWindow({
      icon: icon,
      frame: false,
      fullscreen: false,
      transparent: true,
      width: 420,
      height: 561,
      'min-width': 325,
      'min-height': 225,
      'max-width': 650,
      'max-height': 790
    });
    main.maximizedPrev = null;

    main.loadUrl('file://' + path.join(__dirname, 'index.html'));

    main.on('closed', function() {
      main = null;
    });

    if (app.dock) {
      app.dock.show();
    }
  });
};

var sync =  function() {
  request.get({
    url: 'http://' + constants.serviceHost + '/status'
  }, function(err, resp, body) {
    if (!body || !tray) {
      return;
    }

    try {
      var data = JSON.parse(body);
    } catch (e) {
      err = new errors.ParseError(
        'main: Failed to parse service status (%s)', e);
      logger.error(err);
      tray.setImage(disconnTray);
      return;
    }

    if (data.status) {
      tray.setImage(connTray);
    } else {
      tray.setImage(disconnTray);
    }
  });
};

app.on('ready', function() {
  var profilesPth = path.join(app.getPath('userData'), 'profiles');
  fs.exists(profilesPth, function(exists) {
    if (!exists) {
      fs.mkdir(profilesPth);
    }
  });

  events.subscribe(function(evt) {
    if (evt.type === 'output') {
      var pth = path.join(app.getPath('userData'), 'profiles',
        evt.data.id + '.log');

      fs.appendFile(pth, evt.data.output + '\n', function(err) {
        if (err) {
          console.log(err);
        }
      });
    } else if (evt.type === 'connected') {
      if (tray) {
        tray.setImage(connTray);
      }
    } else if (evt.type === 'disconnected') {
      if (tray) {
        tray.setImage(disconnTray);
      }
    }
  });

  openMainWin();

  tray = new Tray(disconnTray);
  tray.on('clicked', function() {
    openMainWin();
  });
  tray.on('double-clicked', function() {
    openMainWin();
  });

  var menu = Menu.buildFromTemplate([
    {
      label: 'Settings',
      click: function() {
        openMainWin();
      }
    },
    {
      label: 'Exit',
      click: function() {
        request.post({
          url: 'http://' + constants.serviceHost + '/stop'
        }, function() {
          app.quit();
        });
      }
    }
  ]);
  tray.setContextMenu(menu);

  profile.getProfiles(function(err, prfls) {
    if (err) {
      return;
    }

    var prfl;
    for (var i = 0; i < prfls.length; i++) {
      prfl = prfls[i];

      if (prfl.autostart) {
        prfl.connect();
      }
    }
  }, true);

  sync();
  setInterval(function() {
    sync();
  }, 10000);
});
