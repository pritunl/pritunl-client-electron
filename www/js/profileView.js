var fs = require('fs');
var path = require('path');
var $ = require('jquery');
var Mustache = require('mustache');
var profile = require('./profile.js');
var service = require('./service.js');
var editor = require('./editor.js');
var ace = require('./ace/ace.js');
var events = require('./events.js');

var template = fs.readFileSync(
  path.join(__dirname, '..', 'templates', 'profile.html')).toString();

$(document).on('dblclick mousedown', '.no-select, .btn', false);

var toggleMenu = function($profile) {
  $profile.find('.menu').toggleClass('show');
  $profile.find('.menu-backdrop').fadeToggle(75);
};

var openEditor = function($profile, data, typ) {
  var $editor = $profile.find('.' + typ + ' .editor');
  var edtr = new editor.Editor($editor);
  edtr.create();
  edtr.set(data);

  $profile.addClass('editing-' + typ);
  setTimeout(function() {
    toggleMenu($profile);
  }, 55);

  return edtr;
};
var closeEditor = function($profile, typ) {
  var $editor = $profile.find('.' + typ + ' .editor');
  $profile.removeClass('editing-' + typ);
  setTimeout(function() {
    setTimeout(function() {
      $editor.empty();
      $editor.attr('class', 'editor');
    }, 55);
  }, 130);
};

var renderProfile = function(prfl) {
  var edtr;
  var edtrType;
  var $profile = $(Mustache.render(template, prfl.export()));

  prfl.onUpdate = function() {
    var data = prfl.export();
    $profile.find('.info .name').text(data.name);
    $profile.find('.info .uptime').text(data.status);
    $profile.find('.info .server-addr').text(data.serverAddr);
    $profile.find('.info .client-addr').text(data.clientAddr);

    if (prfl.status !== 'disconnected') {
      $profile.find('.menu .connect').hide();
      $profile.find('.menu .disconnect').css('display', 'flex');
    } else {
      $profile.find('.menu .disconnect').hide();
      $profile.find('.menu .connect').css('display', 'flex');
    }
  };

  prfl.onUptime = function(curTime) {
    var uptime = prfl.getUptime(curTime);
    if (!uptime) {
      return;
    }

    $profile.find('.info .uptime').text(uptime);
  };

  prfl.onOutput = function(output) {
    if (edtrType !== 'logs') {
      return;
    }
    edtr.push(output);
  };

  $profile.find('.open-menu i, .menu-backdrop, .menu .item').click(function() {
    toggleMenu($profile);
  });

  $profile.find('.menu .connect').click(function() {
    prfl.connect();
  });

  $profile.find('.menu .disconnect').click(function() {
    prfl.disconnect();
  });

  $profile.find('.menu .edit-config').click(function() {
    edtr = openEditor($profile, prfl.data, 'config');
    edtrType = 'config';
  });

  $profile.find('.menu .view-logs').click(function() {
    edtr = openEditor($profile, prfl.log, 'logs');
    edtrType = 'logs';
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

    closeEditor($profile, 'config');
  });

  $profile.find('.logs .btns .close').click(function() {
    if (!edtr) {
      return;
    }
    edtr.destroy();
    edtr = null;

    closeEditor($profile, 'logs');
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
    var profilesId = {};

    for (i = 0; i < profiles.length; i++) {
      profilesId[profiles[i].id] = profiles[i];
      renderProfile(profiles[i]);
    }

    serv.onUpdate = function(data) {
      for (var id in data) {
        var prfl = profilesId[id];
        if (prfl) {
          prfl.import(data[id]);
        }
      }
    };

    events.subscribe(function(evt) {
      var prfl;

      if (evt.type === 'update') {
        var prfl = profilesId[evt.data.id];
        if (prfl) {
          prfl.import(evt.data);
        }
      } else if (evt.type === 'output') {
        var prfl = profilesId[evt.data.id];
        if (prfl) {
          prfl.pushOutput(evt.data.output);
        }
      }
    });

    setInterval(function() {
      var curTime = Math.floor((new Date).getTime() / 1000);

      for (i = 0; i < profiles.length; i++) {
        profiles[i].onUptime(curTime);
      }
    }, 1000);

    serv.update();
  });
};

renderProfiles();
