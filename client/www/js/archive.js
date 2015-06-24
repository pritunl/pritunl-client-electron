var tar = require('tar');
var fs = require('fs');

var readTarFile = function(pth, callback, endCallback) {
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
          callback(null, entry.path, data);
        }
      });
    })
    .on('end', function() {
      if (endCallback) {
        endCallback();
      }
    });
};

module.exports = {
  readTarFile: readTarFile
};
