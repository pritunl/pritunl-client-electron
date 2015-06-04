var app = require('app');
var path = require('path');
var BrowserWindow = require('browser-window');
var Tray = require('tray');
var Menu = require('menu');

var main = null;
var tray = null;

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

  main.openDevTools();

  main.loadUrl('file://' + path.join(__dirname, 'index.html'));

  main.on('closed', function() {
    main = null;
  });
};

app.on('ready', function() {
  openMainWin();

  tray = new Tray(path.join(__dirname, 'img', 'tray-connected.png'));
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
      label: 'Open Dveloper Tools',
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
