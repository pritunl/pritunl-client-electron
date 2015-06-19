var fs = require('fs');
var tar = require('tar');

var importProfile = function(pth, callback) {
  var ext = pth.split('.');
  ext = ext[ext.length - 1];

  switch (ext) {
    case 'ovpn':
    case 'conf':
      fs.readFile(pth, 'utf8', callback);
      break;
    case 'tar':
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
      break;
    default:
      callback('Unsupported file type', null);
  }
};

module.exports = {
  importProfile: importProfile
};
