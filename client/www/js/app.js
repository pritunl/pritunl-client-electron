var remote = require('remote');
var $ = require('jquery');
var profile = require('./js/profile.js');
var profileView = require('./js/profileView.js');
var config = require('./js/config.js');

profileView.init();

$(document).on('dblclick mousedown', '.no-select, .btn', false);

config.onReady(function() {
  $('.ubuntu').click(function() {
    config.settings.ubuntuClicked += 1;
    config.save();
    $('.ubuntu').remove();
  });
  setTimeout(function() {
    if (config.settings.ubuntuClicked < 2) {
      $('.ubuntu').slideDown(200);
    } else {
      $('.ubuntu').remove();
    }
  }, 500);
});

$('.header .close').click(function() {
  remote.getCurrentWindow().close();
});
$('.header .maximize').click(function() {
  var win = remote.getCurrentWindow();

  if (!win.maximizedPrev) {
    win.maximizedPrev = win.getSize();
    win.setSize(600, 780);
  } else {
    win.setSize(win.maximizedPrev[0], win.maximizedPrev[1]);
    win.maximizedPrev = null;
  }
});
$('.header .minimize').click(function() {
  remote.getCurrentWindow().minimize();
});
