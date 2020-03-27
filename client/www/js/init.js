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
var utils = require('./utils.js');
var profileView = require('./profileView.js');
var remote = require('electron').remote;
var getGlobal = remoteRequire().getGlobal;
var Menu = remoteRequire().Menu;
var app = remoteRequire().app;

constants.key = getGlobal('key');
constants.unixSocket = getGlobal('unixSocket');
constants.icon = getGlobal('icon');
profileView.init();

var systemEdtr;
var serviceEdtr;
var $systemLogs = $('.system-logs');
var $serviceLogs = $('.service-logs');

var readSystemLogs = function(callback) {
  var pth = path.join(utils.getUserDataPath(), 'pritunl.log');

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
  var pth = path.join(utils.getUserDataPath(), 'pritunl.log');

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
    pth = path.join('C:\\', 'ProgramData', 'Pritunl', 'pritunl.log');
  } else {
    pth = path.join(path.sep, 'var', 'log', 'pritunl.log');
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
  $('.auto-reconnect').text('Auto Reconnect ' +
    (!config.settings.disable_reconnect ? 'On' : 'Off'));
  $('.tray-icon').text('Tray Icon ' +
    (!config.settings.disable_tray_icon ? 'On' : 'Off'));
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
    remote.getCurrentWindow().openDevTools();
    return;
  }
});
$('.main-menu .menu-version').text('Pritunl v' + constants.version);
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
});

$('.header .close').click(function() {
  remote.getCurrentWindow().close();
});
$('.header .maximize').click(function(evt) {
  var win = remote.getCurrentWindow();

  if (evt.shiftKey) {
    $('.header .version').toggle();
    return;
  }

  if (!win.maximizedPrev) {
    win.maximizedPrev = win.getSize();
    win.setSize(600, 790);
  } else {
    win.setSize(win.maximizedPrev[0], win.maximizedPrev[1]);
    win.maximizedPrev = null;
  }
});
$('.header .minimize').click(function(evt) {
  if (evt.shiftKey) {
    remote.getCurrentWindow().openDevTools();
    return;
  }

  remote.getCurrentWindow().minimize();
});
$('.header .logo').click(function() {
  var menu = Menu.buildFromTemplate([
    {
      label: 'Pritunl v' + constants.version
    },
    {
      label: 'View System Logs',
      click: function() {
        closeServiceEditor();
        openSystemEditor();
      }
    },
    {
      label: 'View Service Logs',
      click: function() {
        closeSystemEditor();
        openServiceEditor();
      }
    }
  ]);
  menu.popup(remote.getCurrentWindow());
});
