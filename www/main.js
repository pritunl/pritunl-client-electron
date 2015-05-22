var app = require('app');
var BrowserWindow = require('browser-window');
var Tray = require('tray');
var Menu = require('menu');

// TODO
require('crash-reporter').start();

var main = null
var tray = null;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

var openMainWin = function() {
  if (main) {
    return;
  }

  main = new BrowserWindow({
    icon: 'www/img/logo.png',
    //frame: false,
    width: 400,
    height: 550
  });

  main.openDevTools();

  main.loadUrl('file://' + __dirname + '/index.html');

  main.on('closed', function() {
    main = null;
  });
};

app.on('ready', function() {
  tray = new Tray('www/img/tray-connected.png');
  tray.on('clicked', function() {
    openMainWin();
  });

  if (process.platform === 'linux') {
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
          app.quit();
        }
      }
    ]);
    tray.setContextMenu(menu);
  }
});
