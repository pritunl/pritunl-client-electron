var fs = require('fs');
var tar = require('tar');
var app = require('app');
var path = require('path');

var readTarFile = function(pth, callback) {
  // TODO Handle errors
  fs.createReadStream(pth)
    .pipe(tar.Parse())
    .on('entry', function (entry) {
      var data = '';

      entry.on('data', function (content) {
        data += content.toString();
      });
      entry.on('end', function () {
        callback(null, data);
      });
    });
};

var getUserDataPath = function() {
  return app.getPath('userData');
};

module.exports = {
  readFile: fs.readFile,
  writeFile: fs.writeFile,
  exists: fs.exists,
  readdir: fs.readdir,
  unlink: fs.unlink,
  readTarFile: readTarFile,
  getUserDataPath: getUserDataPath
};
