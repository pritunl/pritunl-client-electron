var path = require('path');
var os = require('os');
var $ = require('jquery');
var request = require('request');
var constants = require('./constants.js');
var profile = require('./profile.js');
var service = require('./service.js');
var editor = require('./editor.js');
var errors = require('./errors.js');
var logger = require('./logger.js');
var config = require('./config.js');
var profileView = require('./profileView.js');
var remote = require('electron').remote;
var webFrame = require('electron').webFrame;
var getGlobal = remoteRequire().getGlobal;
var Menu = remoteRequire().Menu;
var app = remoteRequire().app;

constants.key = getGlobal('key');
profileView.init();

if (os.platform() === 'darwin') {
  webFrame.setZoomFactor(0.8);
}

$('.header .close').click(function() {
  remote.getCurrentWindow().close();
});
$('.header .maximize').click(function(evt) {
  var win = remote.getCurrentWindow();

  if (evt.shiftKey) {
    $('.header .version').toggle();
    return;
  }

  if (!win.maximizedPrev) {
    win.maximizedPrev = win.getSize();
    win.setSize(600, 790);
  } else {
    win.setSize(win.maximizedPrev[0], win.maximizedPrev[1]);
    win.maximizedPrev = null;
  }
});
$('.header .minimize').click(function(evt) {
  if (evt.shiftKey) {
    remote.getCurrentWindow().openDevTools();
    return;
  }

  remote.getCurrentWindow().minimize();
});
$('.header .logo').click(function() {
  var menu = Menu.buildFromTemplate([
    {
      label: 'Pritunl v' + constants.version
    },
    {
      label: 'Close to Tray',
      role: 'close'
    },
    {
      label: 'Exit',
      click: function () {
        request.post({
          url: 'http://' + constants.serviceHost + '/stop',
          headers: {
            'Auth-Key': constants.key
          }
        }, function () {
          app.quit();
        });
      }
    }
  ]);
  menu.popup(remote.getCurrentWindow());
});
