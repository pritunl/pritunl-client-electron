var app = remoteRequire('app');

var uuid = function() {
  var id = '';

  for (var i = 0; i < 8; i++) {
    id += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return id;
};

var getUserDataPath = function() {
  return app.getPath('userData');
};

module.exports = {
  uuid: uuid,
  getUserDataPath: getUserDataPath
};
