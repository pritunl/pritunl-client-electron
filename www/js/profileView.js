var remote = require('remote');
var fs = require('fs');
var path = require('path');
var $ = require('jquery');
var Mustache = require('mustache');
var profile = require('./profile.js');
var service = require('./service.js');
var editor = require('./editor.js');
var ace = require('./ace/ace.js');

var template = fs.readFileSync(
  path.join(__dirname, '..', 'templates', 'profile.html')).toString();

$(document).on('dblclick mousedown', '.no-select, .btn', false);

var toggleMenu = function($profile) {
  $profile.find('.menu').toggleClass('show');
  $profile.find('.menu-backdrop').fadeToggle(75);
};

var openEditor = function($profile, $editor, data, typ) {
  var edtr = new editor.Editor($editor);
  edtr.create();
  edtr.set(data);

  $profile.addClass('editing-' + typ);
  setTimeout(function() {
    toggleMenu($profile);
  }, 55);

  return edtr;
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
  var edtr;
  var $profile = $(Mustache.render(template, prfl.export()));

  prfl.onUpdate = function() {
    var data = prfl.export();
    $profile.find('.info .name').text(data.name);
    if (data.uptime) {
      $profile.find('.info .uptime').text(data.uptime);
    }
    $profile.find('.info .server-addr').text(data.serverAddr);
    $profile.find('.info .client-addr').text(data.clientAddr);

    if (data.uptime != 'Disconnected') {
      $profile.find('.menu .connect').hide();
      $profile.find('.menu .disconnect').css('display', 'flex');
    } else {
      $profile.find('.menu .disconnect').hide();
      $profile.find('.menu .connect').css('display', 'flex');
    }
  };

  prfl.onUptime = function(curTime) {
    var conn = prfl.service.connections[prfl.id];
    if (!conn) {
      return;
    }

    if (conn['status'] !== 'connected') {
      return;
    }

    var timestamp = conn['timestamp'];
    if (!timestamp) {
      return;
    }

    var uptime = curTime - timestamp;
    var units;
    var unitStr;
    var uptimeItems = [];

    if (uptime > 86400) {
      units = Math.floor(uptime / 86400);
      uptime -= units * 86400;
      unitStr = units + ' day';
      if (units > 1) {
        unitStr += 's';
      }
      uptimeItems.push(unitStr);
    }

    if (uptime > 3600) {
      units = Math.floor(uptime / 3600);
      uptime -= units * 3600;
      unitStr = units + ' hour';
      if (units > 1) {
        unitStr += 's';
      }
      uptimeItems.push(unitStr);
    }

    if (uptime > 60) {
      units = Math.floor(uptime / 60);
      uptime -= units * 60;
      unitStr = units + ' min';
      if (units > 1) {
        unitStr += 's';
      }
      uptimeItems.push(unitStr);
    }

    if (uptime) {
      unitStr = uptime + ' sec';
      if (uptime > 1) {
        unitStr += 's';
      }
      uptimeItems.push(unitStr);
    }

    $profile.find('.info .uptime').text(uptimeItems.join(' '));
  };

  $profile.find('.open-menu i, .menu-backdrop, .menu .item').click(function(evt) {
    toggleMenu($profile);
  });

  $profile.find('.menu .connect').click(function() {
    prfl.connect();
  });

  $profile.find('.menu .disconnect').click(function() {
    prfl.disconnect();
  });

  $profile.find('.menu .edit-config').click(function() {
    edtr = openConfig(prfl, $profile);
  });

  $profile.find('.menu .view-logs').click(function() {
    edtr = openLog(prfl, $profile);
  });

  $profile.find('.config .btns .save').click(function() {
    if (!edtr) {
      return;
    }
    prfl.data = edtr.get();
    edtr.destroy();
    edtr = null;

    prfl.saveData(function(err) {
      // TODO err
      closeConfig($profile);
    });
  });

  $profile.find('.config .btns .cancel').click(function() {
    if (!edtr) {
      return;
    }
    edtr.destroy();
    edtr = null;

    closeConfig($profile);
  });

  $profile.find('.logs .btns .close').click(function() {
    if (!edtr) {
      return;
    }
    edtr.destroy();
    edtr = null;

    closeLog($profile);
  });

  $profile.find('.logs .btns .clear').click(function() {
    if (!edtr) {
      return;
    }
    edtr.set('');
    prfl.log = '';
    prfl.saveLog(function(err) {
      // TODO err
    });
  });

  $('.profiles .list').append($profile);
};

var renderProfiles = function() {
  var serv = new service.Service();

  profile.getProfiles(serv, function(err, profiles) {
    var i;

    for (i = 0; i < profiles.length; i++) {
      renderProfile(profiles[i]);
    }
  });
};

renderProfiles();
