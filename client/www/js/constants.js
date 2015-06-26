var remote;
try {
  remote = require('remote');
} catch(e) {
}

var platform;
if (remote) {
  platform = remote.process.platform;
} else {
  platform = process.platform;
}

module.exports = {
  platform: platform,
  serviceHost: 'localhost:9770'
};
