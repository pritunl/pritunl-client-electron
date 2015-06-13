var app = require('app');
var path = require('path');
var fs = require('fs');
var BrowserWindow = require('browser-window');
var Tray = require('tray');
var Menu = require('menu');
var events = require('./js/events.js');

var main = null;
var tray = null;

// app.on('window-all-closed', function() {}); TODO

var openMainWin = function() {
  if (main) {
    return;
  }

  main = new BrowserWindow({
    icon: path.join(__dirname, 'img', 'logo.png'),
    frame: false,
    width: 400,
    height: 580,
    'min-width': 280,
    'min-height': 225,
    'max-width': 600,
    'max-height': 780
  });
  main.maximizedPrev = null;

  main.loadUrl('file://' + path.join(__dirname, 'index.html'));

  main.on('closed', function() {
    main = null;
  });
};

app.on('ready', function() {
  events.subscribe(function(evt) {
    if (evt.type !== 'output') {
      return;
    }

    var pth = path.join(app.getPath('userData'), 'profiles',
      evt.data.id + '.log');

    fs.appendFile(pth, evt.data.output + '\n', function(err) {
      if (err) {
        // TODO Error
      }
    });
  });

  openMainWin();
  main.openDevTools(); // TODO

  tray = new Tray(path.join(__dirname, 'img', 'tray_connected_win.png'));
  tray.on('clicked', function() {
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
      label: 'Open Developer Tools',
      click: function() {
        main.openDevTools();
      }
    },
    {
      label: 'Exit',
      click: function() {
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(menu);
});
