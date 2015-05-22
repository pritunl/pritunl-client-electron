var childProcess = require('child_process');
var remote = require('remote');
var $ = require('jquery');

$(document).on('dblclick mousedown', '.no-select, .btn', false);

$('.header .close').click(function() {
  remote.getCurrentWindow().close();
});
$('.header .maximize').click(function() {
  if (remote.getCurrentWindow().isMaximized()) {
    remote.getCurrentWindow().unmaximize();
  } else {
    remote.getCurrentWindow().maximize();
  }
});
$('.header .minimize').click(function() {
  remote.getCurrentWindow().minimize();
});

$('.profile .open-menu i, .profile .menu-backdrop').click(function(evt) {
  var $profile = $(evt.currentTarget).parent();
  if (!$profile.hasClass('profile')) {
    $profile = $profile.parent();
  }

  $profile.find('.menu').animate({width: 'toggle'}, 100);
  $profile.find('.menu-backdrop').animate({width: 'toggle'}, 50);
});
