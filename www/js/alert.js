var $ = require('jquery');

var append = function(typ, msg) {
  var $alerts = $('.alerts');
  var count = $alerts.find('div').size();

  if (count > 2) {
    $alerts.find('div:lt(' + (count - 2) + ')').remove();
  }

  var $alert = $('<div class="' + typ + '"></div>');
  $close = $('<i class="close fa fa-times"></i>');

  $close.click(function() {
    $alert.remove();
  });

  $alert.text(msg);
  $alert.append($close);

  $alerts.append($alert)
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
