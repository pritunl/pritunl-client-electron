require('./js/globals.js');

var app = require('electron').app;
var path = require('path');
var fs = require('fs');
var process = require('process');
var request = require('request');
var dialog = require('electron').dialog;
var BrowserWindow = require('electron').BrowserWindow;
var Tray = require('electron').Tray;
var Menu = require('electron').Menu;
var constants = require('./js/constants.js');
var events = require('./js/events.js');
var profile = require('./js/profile.js');
var service = require('./js/service.js');
var errors = require('./js/errors.js');
var logger = require('./js/logger.js');
var config = require('./js/config.js');

var main = null;
var tray = null;
var wakeup = false;

process.on('uncaughtException', function (error) {
  var errorMsg;
  if (error && error.stack) {
    errorMsg = error.stack;
  } else {
    errorMsg = error;
  }

  dialog.showMessageBox(null, {
    type: 'error',
    buttons: ['Exit'],
    title: 'Pritunl - Process Error',
    message: 'Error occured in main process:\n\n' + errorMsg,
  }).then(function() {
    app.quit();
  });
});

if (app.dock) {
  app.dock.hide();
}

var authPath;
if (process.argv.indexOf('--dev') !== -1) {
  authPath = path.join('..', 'dev', 'auth');
} else {
  if (process.platform === 'win32') {
    authPath = path.join('C:\\', 'ProgramData', 'Pritunl', 'auth');
  } else {
    authPath = path.join(path.sep, 'var', 'run', 'pritunl.auth');
  }
}

if (process.platform === 'linux' || process.platform === 'darwin') {
  global.unixSocket = true;
  constants.unixSocket = true;
}

try {
  global.key = fs.readFileSync(authPath, 'utf8');
  constants.key = global.key;
} catch(err) {
  global.key = null;
  constants.key = null;
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
global.icon = icon;
constants.icon = icon;

var checkService = function(callback) {
  service.ping(function(status) {
    if (!status) {
      var timeout;

      if (callback) {
        timeout = 1000;
      } else {
        timeout = 6000;
      }

      setTimeout(function() {
        service.ping(function(status, statusCode) {
          if (statusCode === 401) {
            if (tray) {
              tray.setImage(disconnTray);
            }
            dialog.showMessageBox(null, {
              type: 'warning',
              buttons: ['Exit'],
              title: 'Pritunl - Service Error',
              message: 'Unable to establish communication with helper ' +
                'service, try restarting computer'
            }).then(function() {
              app.quit();
            });
          } else if (!status) {
            if (tray) {
              tray.setImage(disconnTray);
            }
            dialog.showMessageBox(null, {
              type: 'warning',
              buttons: ['Exit'],
              title: 'Pritunl - Service Error',
              message: 'Unable to communicate with helper service, ' +
              'try restarting computer'
            }).then(function() {
              app.quit();
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
  config.reload(function() {
    if (config.settings.disable_tray_icon || !tray) {
      app.quit();
    } else {
      if (app.dock) {
        app.dock.hide();
      }
      checkService();
    }
  });
});

app.on('open-file', function() {
  openMainWin();
});

app.on('open-url', function() {
  openMainWin();
});

app.on('activate', function() {
  openMainWin();
});

app.on('quit', function() {
  app.quit();
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

    var width;
    var height;
    var minWidth;
    var minHeight;
    var maxWidth;
    var maxHeight;
    if (process.platform === 'darwin') {
      width = 340;
      height = 423;
      minWidth = 304;
      minHeight = 352;
      maxWidth = 540;
      maxHeight = 642;
    } else {
      width = 420;
      height = 528;
      minWidth = 380;
      minHeight = 440;
      maxWidth = 670;
      maxHeight = 800;
    }

    var zoomFactor = 1;
    if (process.platform === 'darwin') {
      zoomFactor = 0.8;
    }

    main = new BrowserWindow({
      title: 'Pritunl',
      icon: icon,
      frame: true,
      autoHideMenuBar: true,
      fullscreen: false,
      width: width,
      height: height,
      show: false,
      sandbox: true,
      minWidth: minWidth,
      minHeight: minHeight,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      backgroundColor: '#151719',
      webPreferences: {
        zoomFactor: zoomFactor,
        nodeIntegration: true
      }
    });
    main.maximizedPrev = null;

    main.on('closed', function() {
      if (process.platform !== 'linux' && !app.dock) {
        app.quit();
      }
      main = null;
    });

    var shown = false;
    main.on('ready-to-show', function() {
      if (shown) {
        return;
      }
      shown = true;
      main.show();
    });
    setTimeout(function() {
      if (shown) {
        return;
      }
      shown = true;
      main.show();
    }, 600);

    main.loadURL('file://' + path.join(__dirname, 'index.html'));

    if (app.dock) {
      app.dock.show();
    }
  });
};

var sync =  function() {
  var url;
  var headers = {
    'Auth-Key': constants.key,
    'User-Agent': 'pritunl'
  };

  if (constants.unixSocket) {
    url = 'http://unix:' + constants.unixPath + ':/status';
    headers['Host'] = 'unix';
  } else {
    url = 'http://' + constants.serviceHost + '/status';
  }

  request.get({
    url: url,
    headers: headers
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
      if (tray) {
        tray.setImage(disconnTray);
      }
      return;
    }

    if (tray) {
      if (data.status) {
        tray.setImage(connTray);
      } else {
        tray.setImage(disconnTray);
      }
    }
  });
};

app.on('ready', function() {
  config.onReady(function() {
    service.wakeup(function(status, statusCode) {
      if (statusCode === 401) {
        dialog.showMessageBox(null, {
          type: 'warning',
          buttons: ['Exit'],
          title: 'Pritunl - Service Error',
          message: 'Unable to establish communication with helper ' +
            'service, try restarting computer'
        }).then(function() {
          app.quit();
        });
        return;
      } else if (status) {
        wakeup = true;
        app.quit();
        return;
      }

      var profilesPth = path.join(app.getPath('userData'), 'profiles');
      fs.exists(profilesPth, function(exists) {
        if (!exists) {
          fs.mkdir(profilesPth, function() {});
        }
      });

      events.subscribe(function(evt) {
        if (evt.type === 'output') {
          var pth = path.join(app.getPath('userData'), 'profiles',
            evt.data.id + '.log');

          fs.appendFile(pth, evt.data.output + '\n', function(err) {
            if (err) {
              err = new errors.ParseError(
                'main: Failed to append profile output (%s)', err);
              logger.error(err);
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
        } else if (evt.type === 'wakeup') {
          openMainWin();
        }
      });

      var noMain = false;
      process.argv.forEach(function(val) {
        if (val === "--no-main") {
          noMain = true;
        }
      });

      if (!noMain) {
        openMainWin();
      } else if (config.settings.disable_tray_icon) {
        app.quit();
        return;
      }

      if (!config.settings.disable_tray_icon) {
        tray = new Tray(disconnTray);
        tray.on('click', function() {
          openMainWin();
        });
        tray.on('double-click', function() {
          openMainWin();
        });
      }

      var appMenu = Menu.buildFromTemplate([
        {
          label: 'Pritunl',
          submenu: [
            {
              label: 'Pritunl v' + constants.version
            },
            {
              label: 'Close',
              accelerator: 'CmdOrCtrl+Q',
              role: 'close'
            },
            {
              label: 'Developer Tools',
              click: function() {
                if (main) {
                  main.openDevTools();
                }
              }
            },
            {
              label: 'Exit',
              click: function() {
                app.quit();
              }
            }
          ]
        },
        {
          label: 'Edit',
          submenu: [
            {
              label: 'Undo',
              accelerator: 'CmdOrCtrl+Z',
              role: 'undo'
            },
            {
              label: 'Redo',
              accelerator: 'Shift+CmdOrCtrl+Z',
              role: 'redo'
            },
            {
              type: 'separator'
            },
            {
              label: 'Cut',
              accelerator: 'CmdOrCtrl+X',
              role: 'cut'
            },
            {
              label: 'Copy',
              accelerator: 'CmdOrCtrl+C',
              role: 'copy'
            },
            {
              label: 'Paste',
              accelerator: 'CmdOrCtrl+V',
              role: 'paste'
            },
            {
              label: 'Select All',
              accelerator: 'CmdOrCtrl+A',
              role: 'selectall'
            }
          ]
        }
      ]);
      Menu.setApplicationMenu(appMenu);
      if (tray) {
        // required on linux 
        tray.setContextMenu(appMenu);
      }

      profile.getProfiles(function(err, prfls) {
        if (err) {
          return;
        }

        var prfl;
        for (var i = 0; i < prfls.length; i++) {
          prfl = prfls[i];

          if (prfl.autostart) {
            prfl.connect('ovpn', false);
          }
        }
      }, true);

      sync();
    });
  });
});
