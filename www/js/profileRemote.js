var fs = require('fs');
var tar = require('tar');

var importProfile = function(pth, callback) {
  fs.createReadStream(pth)
    .pipe(tar.Parse())
    .on('entry', function (entry) {
      var data = '';

      entry.on('data', function (content) {
        data += content.toString();
      });
      entry.on('end', function () {
        callback(data);
      });
    });
};

module.exports = {
  importProfile: importProfile
};
