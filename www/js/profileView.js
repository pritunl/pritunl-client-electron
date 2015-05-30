var remote = require('remote');
var fs = require('fs');
var $ = require('jquery');
var Mustache = require('mustache');
var profile = require('./profile.js');
var ace = require('./ace/ace.js');

var template = fs.readFileSync('www/templates/profile.html').toString();

$(document).on('dblclick mousedown', '.no-select, .btn', false);

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

var renderProfile = function(prfl) {
  var $profile = $(Mustache.render(template, prfl.export()));

  $profile.find('.open-menu i, .menu-backdrop').click(function(evt) {
    if (!$profile.hasClass('profile')) {
      $profile = $profile.parent();
    }
    toggleMenu($profile);
  });

  $profile.find('.menu .connect').click(function() {
    var profile = new Profile('test');
    profile.connect();
  });

  $profile.find('.menu .edit-config').click(function() {
    openConfig($profile);
  });

  $profile.find('.menu .config .btns .cancel').click(function() {
    closeConfig($profile);
  });

  $('.profiles .list').append($profile);
};

var renderProfiles = function() {
  profile.getProfiles(function(err, profiles) {
    for (var i = 0; i < profiles.length; i++) {
      renderProfile(profiles[i]);
    }
  });
};
