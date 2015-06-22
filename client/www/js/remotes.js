var fs = require('fs');
var tar = require('tar');
var app = require('app');
var process = require('process');
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
        if (callback) {
          callback(null, data);
        }
      });
    });
};

var getUserDataPath = function() {
  return app.getPath('userData');
};

module.exports = {
  platform: process.platform,
  readFile: fs.readFile,
  writeFile: fs.writeFile,
  appendFile: fs.appendFile,
  exists: fs.exists,
  readdir: fs.readdir,
  unlink: fs.unlink,
  readTarFile: readTarFile,
  getUserDataPath: getUserDataPath
};
