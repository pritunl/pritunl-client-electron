var fs = require('fs');
var path = require('path');
var $ = require('jquery');
var Mustache = require('mustache');
var profile = require('./profile.js');
var service = require('./service.js');
var editor = require('./editor.js');
var events = require('./events.js');
var errors = require('./errors.js');
var logger = require('./logger.js');

var template = fs.readFileSync(
  path.join(__dirname, '..', 'templates', 'profile.html')).toString();

var openMenu = function($profile) {
  $profile.find('.menu').addClass('show');
  $profile.find('.menu-backdrop').fadeIn(75);
};
var closeMenu = function($profile) {
  var $menu = $profile.find('.menu');
  $menu.removeClass('deleting');
  $menu.removeClass('show');
  $profile.find('.menu-backdrop').fadeOut(75);
};

var openEditor = function($profile, data, typ) {
  var $editor = $profile.find('.' + typ + ' .editor');
  var edtr = new editor.Editor(typ, $editor);
  edtr.create();
  edtr.set(data);

  $profile.addClass('editing-' + typ);

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

  service.add(prfl);

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

  $profile.find('.open-menu i').click(function() {
    openMenu($profile);
  });
  $profile.find('.menu-backdrop').click(function() {
    closeMenu($profile);
  });

  $profile.find('.menu .connect').click(function() {
    prfl.connect();
    closeMenu($profile);
  });

  $profile.find('.menu .disconnect').click(function() {
    prfl.disconnect();
    closeMenu($profile);
  });

  $profile.find('.menu .delete').click(function() {
    $profile.find('.menu').addClass('deleting');
  });
  $profile.find('.menu .delete-yes').click(function() {
    prfl.delete();
    closeMenu($profile);

    service.remove(prfl);
    $profile.remove();
  });
  $profile.find('.menu .delete-no').click(function() {
    $profile.find('.menu').removeClass('deleting');
  });

  $profile.find('.menu .edit-config').click(function() {
    edtr = openEditor($profile, prfl.data, 'config');
    edtrType = 'config';
    closeMenu($profile);
  });

  $profile.find('.menu .view-logs').click(function() {
    edtr = openEditor($profile, prfl.log, 'logs');
    edtrType = 'logs';
    closeMenu($profile);
  });

  $profile.find('.config .btns .save').click(function() {
    if (!edtr) {
      return;
    }
    prfl.data = edtr.get();
    edtr.destroy();
    edtr = null;
    edtrType = null;

    closeEditor($profile, 'config');

    prfl.saveData();
  });

  $profile.find('.config .btns .cancel').click(function() {
    if (!edtr) {
      return;
    }
    edtr.destroy();
    edtr = null;
    edtrType = null;

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
    prfl.saveLog();
  });

  $('.profiles .list').append($profile);
};

var init = function() {
  events.subscribe(function(evt) {
    var prfl;
    var err;

    switch (evt.type) {
      case 'update':
        prfl = service.get(evt.data.id);
        if (prfl) {
          prfl.update(evt.data);
        }
        break;
      case 'output':
        prfl = service.get(evt.data.id);
        if (prfl) {
          prfl.pushOutput(evt.data.output);
        }
        break;
      case 'auth_error':
        prfl = service.get(evt.data.id);
        err = new errors.AuthError(
          'profile_view: Failed to authenicate to %s',
          prfl.formatedNameLogo()[0]);
        logger.error(err);
        break;
      case 'timeout_error':
        prfl = service.get(evt.data.id);
        err = new errors.AuthError(
          'profile_view: Connection timed out to %s',
          prfl.formatedNameLogo()[0]);
        logger.error(err);
        break;
    }
  });

  profile.getProfiles(function(err, prfls) {
    $('.profiles .import-uri').click(function() {
      $('.profiles .import-uri').hide();
      $('.profiles .import-btns').show();
      $('.profiles .uri-input').slideDown(50);
    });

    $('.profiles .import-uri-confirm').click(function() {
      var uri = $('.profiles .uri-input').val();

      profile.importProfileUri(uri, function(err, prfl) {
        if (!err) {
          renderProfile(prfl);
        }

        $('.profiles .import-uri').show();
        $('.profiles .import-btns').hide();
        $('.profiles .uri-input').slideUp(50);
      });
    });

    $('.profiles .import-uri-cancel').click(function() {
      $('.profiles .import-uri').show();
      $('.profiles .import-btns').hide();
      $('.profiles .uri-input').slideUp(50, function() {
        $('.profiles .uri-input').val('');
      });
    });

    $('.profiles .profile-file').change(function(evt) {
      var pth = evt.currentTarget.files[0].path;
      profile.importProfile(pth, function(err, prfl) {
        if (err) {
          err = new errors.AuthError(
            'profile_view: Failed to import profile %s',
            prfl.formatedNameLogo()[0]);
          logger.error(err);
          return;
        }

        renderProfile(prfl);
      });
    });

    for (var i = 0; i < prfls.length; i++) {
      renderProfile(prfls[i]);
    }

    service.update();
  });

  setInterval(function() {
    var curTime = Math.floor((new Date).getTime() / 1000);

    service.iter(function(prfl) {
      prfl.onUptime(curTime);
    });

    service.update();
  }, 1000);
};

module.exports = {
  init: init
};
