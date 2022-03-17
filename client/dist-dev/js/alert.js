var $ = require('jquery');

var append = function(typ, msg) {
  var removed;
  var $alerts = $('.alerts');
  var count = $alerts.find('div').length;

  if (count > 2) {
    removed = true;
    $alerts.find('div:lt(' + (count - 2) + ')').remove();
  }

  var $alert = $('<div class="' + typ + '"></div>');
  var $close = $('<i class="close fa fa-times"></i>');

  $close.click(function() {
    $alert.slideUp(250, function() {
      $alert.remove();
    });
  });

  $alert.text(msg);
  $alert.append($close);
  $alert.hide();

  $alerts.append($alert);
  if (!removed) {
    $alert.slideDown(250);
  } else {
    $alert.show();
  }
};

var info = function(msg) {
  append('info', msg);
};

var warning = function(msg) {
  append('warning', msg);
};

var error = function(msg) {
  append('error', msg);
};

module.exports = {
  info: info,
  warning: warning,
  error: error
};
