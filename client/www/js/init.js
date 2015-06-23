var path = require('path');
var remote = require('remote');
var $ = require('jquery');
var profile = require('./profile.js');
var service = require('./service.js');
var editor = require('./editor.js');
var errors = require('./errors.js');
var logger = require('./logger.js');
var config = require('./config.js');
var profileView = require('./profileView.js');
var BrowserWindow = remoteRequire('browser-window');

profileView.init();

$(document).on('dblclick mousedown', '.no-select, .btn', false);

$ubuntu = $('.ubuntu');
if (remote.process.platform === 'linux') {
  $ubuntu.remove();
} else {
  config.onReady(function() {
    $('.ubuntu .box').click(function() {
      var win = new BrowserWindow({
        icon: path.join(__dirname, 'img', 'logo.png'),
        width: 800,
        height: 600
      });
      win.loadUrl('http://ubuntu.com/desktop');

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
$('.header .maximize').click(function() {
  var win = remote.getCurrentWindow();

  if (!win.maximizedPrev) {
    win.maximizedPrev = win.getSize();
    win.setSize(600, 790);
  } else {
    win.setSize(win.maximizedPrev[0], win.maximizedPrev[1]);
    win.maximizedPrev = null;
  }
});
$('.header .minimize').click(function() {
  remote.getCurrentWindow().minimize();
});
