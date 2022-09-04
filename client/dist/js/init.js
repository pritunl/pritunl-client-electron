var path = require('path');
var os = require('os');
var $ = require('jquery');
var request = require('request');
var fs = require('fs');
var constants = require('./constants.js');
var profile = require('./profile.js');
var service = require('./service.js');
var editor = require('./editor.js');
var errors = require('./errors.js');
var logger = require('./logger.js');
var config = require('./config.js');
var alert = require('./alert.js');
var utils = require('./utils.js');
var profileView = require('./profileView.js');
var ipcRenderer = require('electron').ipcRenderer;

fs.readFile(global.authPath, 'utf8', function(err, data) {
  if (err) {
    ipcRenderer.send("control", "service-auth-error")
  } else {
    constants.key = data;

    service.ping(function(status, statusCode) {
      if (statusCode === 401) {
        ipcRenderer.send("control", "service-conn-error")
      } else if (!status) {
        ipcRenderer.send("control", "service-conn-error")
      } else {
        profileView.init();
      }
    });
  }
});

var systemEdtr;
var serviceEdtr;
var $systemLogs = $('.system-logs');
var $serviceLogs = $('.service-logs');

var readSystemLogs = function(callback) {
  var pth = path.join(utils.getUserDataPath(), 'pritunl-client.log');

  fs.exists(pth, function(exists) {
    if (!exists) {
      callback('');
      return;
    }

    fs.readFile(pth, 'utf8', function(err, data) {
      if (err) {
        err = new errors.ReadError(
          'init: Failed to read system logs (%s)', err);
        logger.error(err);
      } else {
        callback(data);
      }
    });
  });
};

var clearSystemLogs = function(callback) {
  var pth = path.join(utils.getUserDataPath(), 'pritunl-client.log');

  fs.exists(pth, function(exists) {
    if (!exists) {
      callback();
      return;
    }

    fs.unlink(pth, function(err) {
      if (err) {
        err = new errors.ReadError(
          'init: Failed to clear system logs (%s)', err);
        logger.error(err);
      } else {
        callback();
      }
    });
  });
};

var readServiceLogs = function(callback) {
  var pth;
  if (process.platform === 'win32') {
    pth = path.join(constants.winDrive, 'ProgramData',
      'Pritunl', 'pritunl-client.log');
  } else {
    pth = path.join(path.sep, 'var', 'log', 'pritunl-client.log');
  }

  fs.exists(pth, function(exists) {
    if (!exists) {
      callback('');
      return;
    }

    fs.readFile(pth, 'utf8', function(err, data) {
      if (err) {
        err = new errors.ReadError(
          'init: Failed to read service logs (%s)', err);
        logger.error(err);
      } else {
        callback(data);
      }
    });
  });
};

var openSystemEditor = function() {
  if (systemEdtr) {
    return;
  }

  readSystemLogs(function(data) {
    $systemLogs.addClass('open');

    if (systemEdtr) {
      systemEdtr.destroy();
    }

    var $editor = $systemLogs.find('.editor');
    systemEdtr = new editor.Editor('system', $editor);
    systemEdtr.create();
    systemEdtr.set(data);
  });
};
var closeSystemEditor = function() {
  if (systemEdtr) {
    systemEdtr.destroy();
    systemEdtr = null;
  }

  var $editor = $systemLogs.find('.editor');
  $systemLogs.removeClass('open');
  setTimeout(function() {
    $editor.empty();
    $editor.attr('class', 'editor');
  }, 185);
};

var openServiceEditor = function() {
  if (serviceEdtr) {
    return;
  }

  readServiceLogs(function(data) {
    $serviceLogs.addClass('open');

    if (serviceEdtr) {
      serviceEdtr.destroy();
    }

    var $editor = $serviceLogs.find('.editor');
    serviceEdtr = new editor.Editor('service', $editor);
    serviceEdtr.create();
    serviceEdtr.set(data);
  });
};
var closeServiceEditor = function() {
  if (serviceEdtr) {
    serviceEdtr.destroy();
    serviceEdtr = null;
  }

  var $editor = $serviceLogs.find('.editor');
  $serviceLogs.removeClass('open');
  setTimeout(function() {
    $editor.empty();
    $editor.attr('class', 'editor');
  }, 185);
};

config.onReady(function() {
  if (process.platform === 'linux') {
    $('.main-menu').addClass('linux');
  }
  $('.auto-reconnect').text('Auto Reconnect ' +
    (!config.settings.disable_reconnect ? 'On' : 'Off'));
  $('.tray-icon').text('Tray Icon ' +
    (!config.settings.disable_tray_icon ? 'On' : 'Off'));
  $('.classic-interface').text('Use ' +
    (!config.settings.classic_interface ? 'Classic' : 'New') + ' Interface');
});

$('.system-logs .close').click(function(){
  closeSystemEditor();
});

$('.system-logs .clear').click(function(){
  clearSystemLogs(function() {
    if (systemEdtr) {
      systemEdtr.set('');
    }
  });
});

$('.service-logs .close').click(function(){
  closeServiceEditor();
});

$('.open-main-menu').click(function() {
  $('.main-menu').toggleClass('show');
});
$('.main-menu .menu-version').click(function(evt) {
  if (evt.shiftKey) {
    ipcRenderer.send("control", "dev-tools")
  }
});
$('.main-menu .menu-system-logs').click(function (){
  closeServiceEditor();
  openSystemEditor();
  setTimeout(function() {
    $('.main-menu').removeClass('show');
  }, 400);
});
$('.main-menu .menu-service-logs').click(function (){
  closeSystemEditor();
  openServiceEditor();
  setTimeout(function() {
    $('.main-menu').removeClass('show');
  }, 400);
});
$('.main-menu .menu-restart').click(function (){
  var url;
  var headers = {
    'Auth-Key': constants.key,
    'User-Agent': 'pritunl'
  };

  if (constants.unixSocket) {
    url = 'http://unix:' + constants.unixPath + ':/restart';
    headers['Host'] = 'unix';
  } else {
    url = 'http://' + constants.serviceHost + '/restart';
  }

  request.post({
    url: url,
    headers: headers
  });
});
$('.main-menu .auto-reconnect').click(function (){
  config.settings.disable_reconnect = !config.settings.disable_reconnect;
  $('.auto-reconnect').text('Auto Reconnect ' +
    (!config.settings.disable_reconnect ? 'On' : 'Off'));
  config.save();
});
$('.main-menu .tray-icon').click(function (){
  config.settings.disable_tray_icon = !config.settings.disable_tray_icon;
  $('.tray-icon').text('Tray Icon ' +
    (!config.settings.disable_tray_icon ? 'On' : 'Off'));
  config.save();
  alert.info("Tray icon " + (!config.settings.disable_tray_icon ?
      'enabled' : 'disabled') + ", restart client " +
    "for configuration to take effect");
});
$('.main-menu .classic-interface').click(function (){
  config.settings.classic_interface = !config.settings.classic_interface;
  $('.classic-interface').text('Use ' +
    (!config.settings.classic_interface ? 'Classic' : 'New') + ' Interface');
  config.save();
  alert.info("Switched to " + (!config.settings.classic_interface ?
      'new' : 'classic') + " interface, restart client " +
      "for configuration to take effect");
});
