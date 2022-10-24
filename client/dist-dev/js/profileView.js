var path = require('path');
var $ = require('jquery');
var Mustache = require('mustache');
var constants = require('./constants.js');
var profile = require('./profile.js');
var importer = require('./importer.js');
var service = require('./service.js');
var editor = require('./editor.js');
var events = require('./events.js');
var errors = require('./errors.js');
var logger = require('./logger.js');
var template = require('../templates/profile.js');
var ipcRenderer = require('electron').ipcRenderer;

var colors = [
  '#D32F2F',
  '#2196F3',
  '#795548',
  '#5C6BC0',
  '#66BB6A',
];

var openMenu = function($profile) {
  $profile.addClass('menu-open');
  $profile.find('.menu').addClass('show');
};
var unbindAll = function($profile) {
  $profile.find('.menu .connect-confirm').unbind('click');
  $profile.find('.connect-pin-input').unbind('keypress');
  $profile.find('.connect-otp-input').unbind('keypress');
  $profile.find('.connect-yubikey-input').unbind('keypress');
  $profile.find('.connect-user-input').unbind('keypress');
  $profile.find('.connect-pass-input').unbind('keypress');
};
var closeMenu = function($profile) {
  $profile.removeClass('menu-open');
  var $menu = $profile.find('.menu');
  $menu.removeClass('authenticating-user');
  $menu.removeClass('authenticating-pass');
  $menu.removeClass('authenticating-pin');
  $menu.removeClass('authenticating-otp');
  $menu.removeClass('authenticating-yubikey');
  $menu.removeClass('connecting');
  $menu.removeClass('renaming');
  $menu.removeClass('deleting');
  $menu.removeClass('autostarting');
  $menu.removeClass('show');
  $profile.find('.menu .connect').removeClass('disabled');
  var $inputs = $profile.find('.menu input');
  $inputs.blur();
  $inputs.val('');
  unbindAll($profile);
};

var openEditor = function($profile, data, typ) {
  $profile.addClass('editing-' + typ);

  var $editor = $profile.find('.' + typ + ' .editor');
  var edtr = new editor.Editor(typ, $editor);
  edtr.create();
  edtr.set(data);

  return edtr;
};
var closeEditor = function($profile, typ) {
  var $editor = $profile.find('.' + typ + ' .editor');
  $profile.removeClass('editing-' + typ);
  setTimeout(function() {
    $editor.empty();
    $editor.attr('class', 'editor');
  }, 185);
};

var renderProfile = function(index, prfl) {
  var edtr;
  var edtrType;

  var data = prfl.export();
  data['logoColor'] = colors[index % 5];
  var $profile = $(Mustache.render(template, data));

  service.add(prfl);

  prfl.onUpdate = function() {
    var data = prfl.export();
    $profile.find('.info .name').text(data.name);
    $profile.find('.logo').css('background-color', colors[index % 5]);
    $profile.find('.info .uptime').text(data.status);
    $profile.find('.menu .autostart').text('Autostart ' + data.autostart);
    $profile.find('.info .server-addr').text(data.serverAddr);
    $profile.find('.info .client-addr').text(data.clientAddr);

    if ((prfl.systemPrfl && prfl.state) ||
        (!prfl.systemPrfl && prfl.status !== 'disconnected')) {
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

  var prflConnect = function(mode) {
    prfl.postConnect(mode, true, function(authType, callback) {
      if (!authType) {
        closeMenu($profile);
        return;
      }

      var handler;
      var username = '';
      var password = '';
      authType = authType.split('_');

      var authHandler = function() {
        if (authType.indexOf('username') !== -1) {
          authType.splice(authType.indexOf('username'), 1);

          handler = function(evt) {
            if (evt.type === 'keypress' && evt.which !== 13) {
              return;
            }
            unbindAll($profile);

            var user = $profile.find('.connect-user-input').val();
            if (user) {
              username = user;

              if (!authType.length) {
                callback(username, password);
                closeMenu($profile);
              } else {
                authHandler();
              }
            } else {
              closeMenu($profile);
            }
          };

          $profile.find('.menu .connect-confirm').bind('click', handler);
          $profile.find('.connect-user-input').bind('keypress', handler);
          $profile.find('.menu').addClass('authenticating-user');
          setTimeout(function() {
            $profile.find('.connect-user-input').focus();
          }, 150);
        } else if (authType.indexOf('password') !== -1) {
          authType.splice(authType.indexOf('password'), 1);

          handler = function(evt) {
            if (evt.type === 'keypress' && evt.which !== 13) {
              return;
            }
            unbindAll($profile);

            var pass = $profile.find('.connect-pass-input').val();
            if (pass) {
              password += pass;

              if (!authType.length) {
                callback(username, password);
                closeMenu($profile);
              } else {
                authHandler();
              }
            } else {
              closeMenu($profile);
            }
          };

          $profile.find('.menu .connect-confirm').bind('click', handler);
          $profile.find('.connect-pass-input').bind('keypress', handler);
          $profile.find('.menu').addClass('authenticating-pass');
          setTimeout(function() {
            $profile.find('.connect-pass-input').focus();
          }, 150);
        } else if (authType.indexOf('pin') !== -1) {
          authType.splice(authType.indexOf('pin'), 1);

          handler = function(evt) {
            if (evt.type === 'keypress' && evt.which !== 13) {
              return;
            }
            unbindAll($profile);

            var pin = $profile.find('.connect-pin-input').val();
            if (pin) {
              password += pin;

              if (!authType.length) {
                callback(username, password);
                closeMenu($profile);
              } else {
                authHandler();
              }
            } else {
              closeMenu($profile);
            }
          };

          $profile.find('.menu .connect-confirm').bind('click', handler);
          $profile.find('.connect-pin-input').bind('keypress', handler);
          $profile.find('.menu').addClass('authenticating-pin');
          setTimeout(function() {
            $profile.find('.connect-pin-input').focus();
          }, 150);
        } else if (authType.indexOf('duo') !== -1) {
          authType.splice(authType.indexOf('duo'), 1);
          authType.splice(authType.indexOf('otp'), 1);

          $profile.find('.connect-otp-input').attr(
            'placeholder', 'Enter Duo Passcode');

          handler = function(evt) {
            if (evt.type === 'keypress' && evt.which !== 13) {
              return;
            }
            unbindAll($profile);

            var otpCode = $profile.find('.connect-otp-input').val();
            if (otpCode) {
              password += otpCode;

              if (!authType.length) {
                callback(username, password);
                closeMenu($profile);
              } else {
                authHandler();
              }
            } else {
              closeMenu($profile);
            }
          };

          $profile.find('.menu .connect-confirm').bind('click', handler);
          $profile.find('.connect-otp-input').bind('keypress', handler);
          $profile.find('.menu').addClass('authenticating-otp');
          setTimeout(function() {
            $profile.find('.connect-otp-input').focus();
          }, 150);
        } else if (authType.indexOf('onelogin') !== -1) {
          authType.splice(authType.indexOf('onelogin'), 1);
          authType.splice(authType.indexOf('otp'), 1);

          $profile.find('.connect-otp-input').attr(
            'placeholder', 'Enter OneLogin Passcode');

          handler = function(evt) {
            if (evt.type === 'keypress' && evt.which !== 13) {
              return;
            }
            unbindAll($profile);

            var otpCode = $profile.find('.connect-otp-input').val();
            if (otpCode) {
              password += otpCode;

              if (!authType.length) {
                callback(username, password);
                closeMenu($profile);
              } else {
                authHandler();
              }
            } else {
              closeMenu($profile);
            }
          };

          $profile.find('.menu .connect-confirm').bind('click', handler);
          $profile.find('.connect-otp-input').bind('keypress', handler);
          $profile.find('.menu').addClass('authenticating-otp');
          setTimeout(function() {
            $profile.find('.connect-otp-input').focus();
          }, 150);
        } else if (authType.indexOf('okta') !== -1) {
          authType.splice(authType.indexOf('okta'), 1);
          authType.splice(authType.indexOf('otp'), 1);

          $profile.find('.connect-otp-input').attr(
            'placeholder', 'Enter Okta Passcode');

          handler = function(evt) {
            if (evt.type === 'keypress' && evt.which !== 13) {
              return;
            }
            unbindAll($profile);

            var otpCode = $profile.find('.connect-otp-input').val();
            if (otpCode) {
              password += otpCode;

              if (!authType.length) {
                callback(username, password);
                closeMenu($profile);
              } else {
                authHandler();
              }
            } else {
              closeMenu($profile);
            }
          };

          $profile.find('.menu .connect-confirm').bind('click', handler);
          $profile.find('.connect-otp-input').bind('keypress', handler);
          $profile.find('.menu').addClass('authenticating-otp');
          setTimeout(function() {
            $profile.find('.connect-otp-input').focus();
          }, 150);
        } else if (authType.indexOf('yubikey') !== -1) {
          authType.splice(authType.indexOf('yubikey'), 1);

          handler = function(evt) {
            if (evt.type === 'keypress' && evt.which !== 13) {
              return;
            }
            unbindAll($profile);

            var otpCode = $profile.find('.connect-yubikey-input').val();
            if (otpCode) {
              password += otpCode;

              if (!authType.length) {
                callback(username, password);
                closeMenu($profile);
              } else {
                authHandler();
              }
            } else {
              closeMenu($profile);
            }
          };

          $profile.find('.menu .connect-confirm').bind('click', handler);
          $profile.find('.connect-yubikey-input').bind('keypress', handler);
          $profile.find('.menu').addClass('authenticating-yubikey');
          setTimeout(function() {
            $profile.find('.connect-yubikey-input').focus();
          }, 150);
        } else if (authType.indexOf('otp') !== -1) {
          authType.splice(authType.indexOf('otp'), 1);

          $profile.find('.connect-otp-input').attr(
            'placeholder', 'Enter OTP Code');

          handler = function(evt) {
            if (evt.type === 'keypress' && evt.which !== 13) {
              return;
            }
            unbindAll($profile);

            var otpCode = $profile.find('.connect-otp-input').val();
            if (otpCode) {
              password += otpCode;

              if (!authType.length) {
                callback(username, password);
                closeMenu($profile);
              } else {
                authHandler();
              }
            } else {
              closeMenu($profile);
            }
          };

          $profile.find('.menu .connect-confirm').bind('click', handler);
          $profile.find('.connect-otp-input').bind('keypress', handler);
          $profile.find('.menu').addClass('authenticating-otp');
          setTimeout(function() {
            $profile.find('.connect-otp-input').focus();
          }, 150);
        } else {
          callback(username, password);
          closeMenu($profile);
        }
      };
      authHandler();
    }, function() {
      refreshProfiles();
    });
  };

  $profile.find('.menu .connect').click(function() {
    if ($profile.find('.menu .connect').hasClass('disabled')) {
      return;
    }
    $profile.find('.menu .connect').addClass('disabled');

    prfl.preConnect(function() {
      var data = prfl.export();

      if (constants.wg && data.wg) {
        $profile.find('.menu').addClass('connecting');
      } else {
        if (prfl.preConnectMsg) {
          var preConnectMsg = prfl.preConnectMsg;
          if (preConnectMsg instanceof Array) {
            preConnectMsg = preConnectMsg.join('\n');
          }

          prflConnect('ovpn');
        } else {
          prflConnect('ovpn');
        }
      }
    });
  });

  $profile.find('.menu .connect-ovpn').click(function() {
    $profile.find('.menu').removeClass('connecting');

    var data = prfl.export();

    if (prfl.preConnectMsg) {
      var preConnectMsg = prfl.preConnectMsg;
      if (preConnectMsg instanceof Array) {
        preConnectMsg = preConnectMsg.join('\n');
      }

      prflConnect('ovpn');
    } else {
      prflConnect('ovpn');
    }
  });

  $profile.find('.menu .connect-wg').click(function() {
    $profile.find('.menu').removeClass('connecting');

    var data = prfl.export();

    if (prfl.preConnectMsg) {
      var preConnectMsg = prfl.preConnectMsg;
      if (preConnectMsg instanceof Array) {
        preConnectMsg = preConnectMsg.join('\n');
      }

      prflConnect('wg');
    } else {
      prflConnect('wg');
    }
  });

  $profile.find('.menu .connect-cancel').click(function() {
    var $menu = $profile.find('.menu');
    $menu.removeClass('authenticating-user');
    $menu.removeClass('authenticating-pass');
    $menu.removeClass('authenticating-pin');
    $menu.removeClass('authenticating-otp');
    $menu.removeClass('authenticating-yubikey');
    $menu.removeClass('connecting');
    $profile.find('.menu .connect').removeClass('disabled');
    $profile.find('.menu .connect-user-input').blur();
    $profile.find('.menu .connect-user-input').val('');
    $profile.find('.menu .connect-pass-input').blur();
    $profile.find('.menu .connect-pass-input').val('');
    $profile.find('.menu .connect-pin-input').blur();
    $profile.find('.menu .connect-pin-input').val('');
    $profile.find('.menu .connect-otp-input').blur();
    $profile.find('.menu .connect-otp-input').val('');
    unbindAll($profile);
  });

  $profile.find('.menu .disconnect').click(function() {
    prfl.disconnect(function() {
      refreshProfiles();
    });
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

  $profile.find('.menu .rename').click(function() {
    $profile.find('.menu').addClass('renaming');
  });
  $profile.find('.menu .rename-confirm').click(function() {
    var $renameInput = $profile.find('.menu .rename-input');

    prfl.name = $renameInput.val();
    prfl.saveConf();

    $profile.find('.menu').removeClass('renaming');
    $renameInput.blur();
    $renameInput.val('');
  });
  $profile.find('.menu .rename-cancel').click(function() {
    $profile.find('.menu').removeClass('renaming');
    $profile.find('.menu .rename-input').blur();
    $profile.find('.menu .rename-input').val('');
  });

  $profile.find('.menu .autostart').click(function() {
    $profile.find('.menu').addClass('autostarting');
  });
  $profile.find('.menu .autostart-on').click(function() {
    prfl.autostartOn(function() {
      closeMenu($profile);
      refreshProfiles();
    });
  });
  $profile.find('.menu .autostart-off').click(function() {
    prfl.autostartOff(function() {
      closeMenu($profile);
      refreshProfiles();
    });
  });

  $profile.find('.menu .edit-config').click(function() {
    edtr = openEditor($profile, prfl.data, 'config');
    edtrType = 'config';
    closeMenu($profile);
  });

  $profile.find('.menu .view-logs').click(function() {
    prfl.getOutput(function(data) {
      edtr = openEditor($profile, data, 'logs');
      edtrType = 'logs';
      closeMenu($profile);
    });
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
    edtrType = null;

    closeEditor($profile, 'logs');
  });

  $profile.find('.logs .btns .clear').click(function() {
    if (!edtr) {
      return;
    }
    edtr.set('');
    prfl.clearLog();
  });

  $('.profiles .list').append($profile);
};

var refreshProfiles = function() {
  profile.getProfilesAll(function(err, prfls) {
    if (err) {
      err = new errors.ReadError(
        'importer: Failed to read profiles (%s)', err);
      logger.error(err);
      return;
    }

    var prfl;
    var curPrfl;
    for (var i = 0; i < prfls.length; i++) {
      prfl = prfls[i];

      curPrfl = service.get(prfl.id);
      if (curPrfl) {
        curPrfl.refresh(prfl);
      }
    }
  });
};

var init = function() {
  events.subscribe(function(evt) {
    var prfl;
    var err;

    switch (evt.type) {
      case 'update':
        if (evt.data) {
          prfl = service.get(evt.data.id);
          if (prfl) {
            prfl.update(evt.data);
          }
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
          'profile_view: Failed to authenticate to %s',
          prfl.formatedName());
        logger.error(err);
        break;
      case 'inactive':
        prfl = service.get(evt.data.id);
        err = new errors.AuthError(
          'profile_view: Disconnected due to inactivity on %s',
          prfl.formatedName());
        logger.error(err);
        break;
      case 'timeout_error':
        prfl = service.get(evt.data.id);
        err = new errors.AuthError(
          'profile_view: Connection timed out to %s',
          prfl.formatedName());
        logger.error(err);
        break;
      case 'offline_error':
        prfl = service.get(evt.data.id);
        err = new errors.AuthError(
          'profile_view: Server offline on %s',
          prfl.formatedName());
        logger.error(err);
        break;
      case 'connection_error':
        prfl = service.get(evt.data.id);
        err = new errors.AuthError(
          'profile_view: Failed to connect to %s',
          prfl.formatedName());
        logger.error(err);
        break;
      case 'configuration_error':
        prfl = service.get(evt.data.id);
        err = new errors.AuthError(
          'profile_view: Failed to configure connection for %s',
          prfl.formatedName());
        logger.error(err);
        break;
      case 'handshake_timeout':
        prfl = service.get(evt.data.id);
        err = new errors.AuthError(
          'profile_view: Handshake timeout on %s',
          prfl.formatedName());
        logger.error(err);
        break;
    }
  });

  service.state(function(err, state) {
    if (!err && state) {
      constants.wg = state.wg;
      constants.version = state.version;
      $('.version').text('v' + constants.version);
      $('.main-menu .menu-version').text('Pritunl v' + constants.version);

      if (state.upgrade) {
        $('.alerts .upgrade').show();
      }
    }

    initProfiles();
  });
};

var initProfiles = function() {
  profile.getProfilesAll(function(err, prfls) {
    var profileCount = 0;

    var importLock = false;
    var importUri = function() {
      if (importLock) {
        return;
      }
      importLock = true;
      $('.profiles .uri-input').attr('disabled', 'disabled');
      $('.loading-ring').addClass('loading');
      $('.profiles .import-uri-confirm').addClass('disabled');
      $('.profiles .import-uri-cancel').addClass('disabled');

      var uri = $('.profiles .uri-input').val();

      importer.importProfileUri(uri, function(prfls) {
        if (prfls) {
          for (var i = 0; i < prfls.length; i++) {
            renderProfile(profileCount, prfls[i]);
            profileCount += 1;
          }
        }
        refreshProfiles();

        $('.profiles .import-btns').hide();
        $('.profiles .import').show();
        $('.profiles .import-uri').show();
        $('.profiles .open-main-menu').show();
        $('.profiles .uri-input').slideUp(50, function() {
          $('.profiles .uri-input').val('');
        });

        $('.profiles .uri-input').removeAttr('disabled');
        $('.profiles .import-uri-confirm').removeClass('disabled');
        $('.profiles .import-uri-cancel').removeClass('disabled');
        $('.loading-ring').removeClass('loading');
        importLock = false;
      });
    };

    $('.profiles .import-uri').click(function() {
      $('.main-menu').removeClass('show');
      $('.profiles .import').hide();
      $('.profiles .import-uri').hide();
      $('.profiles .open-main-menu').hide();
      $('.profiles .import-btns').show();
      $('.profiles .uri-input').slideDown(50, function() {
        $('.profiles .uri-input').focus();
      });
    });

    $('.profiles .uri-input').keypress(function(evt) {
      if (evt.which === 13) {
        importUri();
      }
    });

    $('.profiles .import-uri-confirm').click(function() {
      if ($('.profiles .import-uri-confirm').hasClass('disabled')) {
        return;
      }

      importUri();
    });

    $('.profiles .import-uri-cancel').click(function() {
      if ($('.profiles .import-uri-cancel').hasClass('disabled')) {
        return;
      }

      $('.profiles .import-btns').hide();
      $('.profiles .import').show();
      $('.profiles .import-uri').show();
      $('.profiles .open-main-menu').show();
      $('.profiles .uri-input').slideUp(50, function() {
        $('.profiles .uri-input').val('');
      });
    });

    $('html').on('dragover', function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }).on('dragleave', function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }).on('drop', function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      if (evt.originalEvent.dataTransfer &&
          evt.originalEvent.dataTransfer.files.length) {
        var pth = evt.originalEvent.dataTransfer.files[0].path;

        importer.importProfile(pth, function(prfls) {
          if (prfls) {
            for (var i = 0; i < prfls.length; i++) {
              renderProfile(profileCount, prfls[i]);
              profileCount += 1;
            }
          }
          refreshProfiles();
        });
      }
    });

    $('.profiles .profile-file').change(function(evt) {
      if (!evt.currentTarget.files.length) {
        return;
      }
      var pth = evt.currentTarget.files[0].path;
      $('.profiles .profile-file').val('');

      importer.importProfile(pth, function(prfls) {
        if (prfls) {
          for (var i = 0; i < prfls.length; i++) {
            renderProfile(profileCount, prfls[i]);
            profileCount += 1;
          }
        }
        refreshProfiles();
      });
    });

    for (var i = 0; i < prfls.length; i++) {
      renderProfile(profileCount, prfls[i]);
      profileCount += 1;
    }

    service.update();
  });

  setInterval(function() {
    var curTime = Math.floor((new Date).getTime() / 1000);

    service.iter(function(prfl) {
      prfl.onUptime(curTime);
    });

    service.update(function(err) {
      if (err) {
        setTimeout(function() {
          service.ping(function(status) {
            if (!status) {
              ipcRenderer.send("control", "service-conn-error")
            }
          });
        }, 10000);
      }
    });
  }, 1000);
};

module.exports = {
  init: init
};
