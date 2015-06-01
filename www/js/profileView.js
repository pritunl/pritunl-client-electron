var remote = require('remote');
var fs = require('fs');
var $ = require('jquery');
var Mustache = require('mustache');
var profile = require('./profile.js');
var ace = require('./ace/ace.js');

var template = fs.readFileSync('www/templates/profile.html').toString();

$(document).on('dblclick mousedown', '.no-select, .btn', false);

var toggleMenu = function($profile) {
  $profile.find('.menu').toggleClass('show');
  $profile.find('.menu-backdrop').fadeToggle(75);
};

var openEditor = function($profile, $editor, data, typ) {
  var editor = ace.edit($editor[0]);
  editor.setTheme('ace/theme/cobalt');
  editor.setFontSize(12);
  editor.setShowPrintMargin(false);
  editor.setShowFoldWidgets(false);
  editor.getSession().setMode('ace/mode/text');
  editor.getSession().setValue(data);

  $profile.addClass('editing-' + typ);
  setTimeout(function() {
    toggleMenu($profile);
  }, 55);

  return editor;
};
var closeEditor = function($profile, $editor, typ) {
  $profile.removeClass('editing-' + typ);
  setTimeout(function() {
    setTimeout(function() {
      $editor.empty();
      $editor.attr('class', 'editor');
    }, 55);
  }, 130);
};
var destroyEditor = function(editor) {
  var data = editor.getSession().getValue();
  editor.destroy();

  return data;
};

var openConfig = function(prfl, $profile) {
  var $editor = $profile.find('.config .editor');
  return openEditor($profile, $editor, prfl.data, 'config');
};
var closeConfig = function($profile) {
  var $editor = $profile.find('.config .editor');
  return closeEditor($profile, $editor, 'config');
};

var openLog = function(prfl, $profile) {
  var $editor = $profile.find('.logs .editor');
  return openEditor($profile, $editor, prfl.log, 'logs');
};
var closeLog = function($profile) {
  var $editor = $profile.find('.logs .editor');
  return closeEditor($profile, $editor, 'logs');
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
    prfl.connect();
  });

  $profile.find('.menu .edit-config').click(function() {
    editor = openConfig(prfl, $profile);
  });

  $profile.find('.menu .view-logs').click(function() {
    editor = openLog(prfl, $profile);
  });

  $profile.find('.config .btns .save').click(function() {
    if (!editor) {
      return;
    }
    prfl.data = destroyEditor(editor);
    editor = null;

    prfl.saveData(function(err) {
      closeConfig($profile);
    });
  });

  $profile.find('.config .btns .cancel').click(function() {
    if (!editor) {
      return;
    }
    destroyEditor(editor);
    editor = null;

    closeConfig($profile);
  });

  $profile.find('.logs .btns .close').click(function() {
    if (!editor) {
      return;
    }
    destroyEditor(editor);
    editor = null;

    closeLog($profile);
  });

  $profile.find('.logs .btns .clear').click(function() {
    if (!editor) {
      return;
    }
    editor.getSession().setValue('');
    prfl.log = '';
    prfl.saveLog(function(err) {
    });
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
