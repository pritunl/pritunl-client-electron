var $ = require('jquery');
var Mustache = require('mustache');

var append = function(typ, msg) {
  var $alerts = $('.alerts');
  var count = $alerts.find('div').size();

  if (count > 2) {
    $alerts.find('div:lt(' + (count - 2) + ')').remove();
  }

  var $alert = $('<div class="' + typ + '"></div>');
  $alert.text(msg);

  $alerts.append($alert)
};

var error = function(msg) {
  append('error', msg);
};

module.exports = {
  info: info,
  warning: warning,
  error: error
};
