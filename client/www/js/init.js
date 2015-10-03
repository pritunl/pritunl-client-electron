var path = require('path');
var os = require('os');
var $ = require('jquery');
var profile = require('./profile.js');
var service = require('./service.js');
var editor = require('./editor.js');
var errors = require('./errors.js');
var logger = require('./logger.js');
var config = require('./config.js');
var profileView = require('./profileView.js');
var remote = require('remote');
var BrowserWindow = remoteRequire('browser-window');

profileView.init();

$(document).on('dblclick mousedown', '.no-select, .btn', false);

$ubuntu = $('.ubuntu');
if (os.platform() === 'linux') {
  $ubuntu.remove();
} else {
  config.onReady(function() {
    $('.ubuntu .box').click(function() {
      new BrowserWindow({
        icon: path.join(__dirname, 'img', 'logo.png'),
        width: 800,
        height: 600
      }).loadUrl('http://ubuntu.com/desktop');

      config.settings.showUbuntu = false;
      config.save();
      $ubuntu.slideUp(200, function() {
        $ubuntu.remove();
      });
    });

    $('.ubuntu .close').click(function() {
      config.settings.showUbuntu = false;
      config.save();
      $ubuntu.slideUp(200, function() {
        $ubuntu.remove();
      });
    });

    setTimeout(function() {
      if (config.settings.showUbuntu) {
        $ubuntu.slideDown(200);
      } else {
        $ubuntu.remove();
      }
    }, 500);
  });
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
