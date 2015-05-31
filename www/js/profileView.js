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

var openConfig = function(prfl, $profile) {
  var $editor = $profile.find('.config .editor');

  var editor = ace.edit($editor[0]);
  editor.setTheme('ace/theme/cobalt');
  editor.setFontSize(12);
  editor.setShowPrintMargin(false);
  editor.setShowFoldWidgets(false);
  editor.getSession().setMode('ace/mode/text');
  editor.getSession().setValue(prfl.data);

  $profile.find('.config').fadeIn(50);
  setTimeout(function() {
    $profile.addClass('editing');
    toggleMenu($profile);
  }, 55);

  return editor;
};
var closeConfig = function($profile) {
  $profile.removeClass('editing');

  setTimeout(function() {
    $profile.find('.config').fadeOut(50);
    setTimeout(function() {
      var $editor = $profile.find('.config .editor');
      $editor.empty();
      $editor.attr('class', 'editor');
    }, 55);
  }, 130);
};

var renderProfile = function(prfl) {
  var editor;
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
    editor = openConfig(prfl, $profile);
  });

  $profile.find('.config .btns .save').click(function() {
    if (!editor) {
      return;
    }
    var data = editor.getSession().getValue();
    editor.destroy();
    editor = null;

    prfl.data = data;
    prfl.saveData(function(err) {
      closeConfig($profile);
    });
  });

  $profile.find('.config .btns .cancel').click(function() {
    if (!editor) {
      return;
    }
    editor.destroy();
    editor = null;

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
