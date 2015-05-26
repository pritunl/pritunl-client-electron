var remote = require('remote');
var $ = require('jquery');
var Profile = require('./js/profile.js');

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

var toggleMenu = function($profile) {
  $profile.find('.menu').animate({width: 'toggle'}, 100);
  $profile.find('.menu-backdrop').fadeToggle(75);
};
var openConfig = function($profile) {
  $profile.find('.config').fadeIn(50);
  setTimeout(function() {
    $profile.addClass('editing');
    toggleMenu($profile);
  }, 55);
};
var closeConfig = function($profile) {
  $profile.removeClass('editing');
  setTimeout(function() {
    $profile.find('.config').fadeOut(50);
  }, 130);
};

$('.profile .open-menu i, .profile .menu-backdrop').click(function(evt) {
  var $profile = $(evt.currentTarget).parent();
  if (!$profile.hasClass('profile')) {
    $profile = $profile.parent();
  }
  toggleMenu($profile);
});

$('.profile .menu .connect').click(function(evt) {
  var profile = new Profile('test');
  profile.connect();
});

$('.profile .menu .edit-config').click(function(evt) {
  var $profile = $(evt.currentTarget).parent().parent();
  openConfig($profile);
});

$('.profile .config .btns .cancel').click(function(evt) {
  var $profile = $(evt.currentTarget).parent().parent().parent();
  closeConfig($profile);
});
