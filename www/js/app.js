var $ = require('jquery');

$(document).on('dblclick mousedown', '.no-select, .btn', false);

$('.profile .open-menu i, .profile .menu-backdrop').click(function(evt) {
  var $profile = $(evt.currentTarget).parent();
  if (!$profile.hasClass('profile')) {
    $profile = $profile.parent();
  }

  $profile.find('.menu').animate({width: 'toggle'}, 100);
  $profile.find('.menu-backdrop').animate({width: 'toggle'}, 50);
});
