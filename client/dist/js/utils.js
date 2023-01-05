var request = require('request');
var crypto = require('crypto');
var ipcRenderer = require('electron').ipcRenderer;

var uuid = function() {
  var id = '';

  for (var i = 0; i < 4; i++) {
    id += Math.floor((1 + Math.random()) * 0x10000).toString(
      16).substring(1);
  }

  return id;
};

var time = function() {
  return Math.floor((new Date).getTime() / 1000);
};

var args = new Map();
var queryVals = window.location.search.substring(1).split('&');
for (var item of queryVals) {
  var items = item.split('=');
  if (items.length < 2) {
    continue;
  }

  var key = items[0];
  var value = items.slice(1).join('=');

  args.set(key, decodeURIComponent(value));
}

var getUserDataPath = function() {
  return args.get('dataPath');
};

var authRequest = function(method, host, path, token, secret, jsonData,
    callback) {
  method = method.toUpperCase();

  var authTimestamp = Math.floor(new Date().getTime() / 1000).toString();
  var authNonce = uuid();
  var authString = [token, authTimestamp, authNonce, method, path];

  var data;
  if (jsonData) {
    data = JSON.stringify(jsonData);
    authString.push(data);
  }

  authString = authString.join('&');

  var authSignature = crypto.createHmac('sha512', secret).update(
    authString).digest('base64');

  var headers = {
    'User-Agent': 'pritunl',
    'Auth-Token': token,
    'Auth-Timestamp': authTimestamp,
    'Auth-Nonce': authNonce,
    'Auth-Signature': authSignature
  };
  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  request({
    method: method,
    url: host + path,
    json: data ? true : undefined,
    body: data,
    headers: headers,
    strictSSL: false,
    timeout: 3000
  }, function(err, resp, body) {
    if (callback) {
      callback(err, resp, body);
    }
  });
};

function WaitGroup() {
  this.count = 0;
  this.waiter = null;
}

WaitGroup.prototype.add = function(count) {
  this.count += count || 1;
};

WaitGroup.prototype.done = function() {
  this.count -= 1;
  if (this.count <= 0) {
    if (this.waiter) {
      this.waiter();
    }
  }
};

WaitGroup.prototype.wait = function(callback) {
  if (this.count === 0) {
    callback();
  } else {
    this.waiter = callback;
  }
};

var encryptString = function(decData, callback) {
  ipcRenderer.invoke("processing", "encrypt", decData).then(function(resp) {
    var err;
    if (!resp) {
      err = new errors.ParseError(
        'utils: Failed to encrypt string');
      logger.error(err);
      callback(err, null)
    } else if (resp[0]) {
      err = new errors.ParseError(
        'utils: Failed to encrypt string (%s)', resp[0]);
      logger.error(err);
      callback(err, null)
    } else {
      callback(null, resp[1])
    }
  })
};

var decryptString = function(encData, callback) {
  ipcRenderer.invoke("processing", "decrypt", encData).then(function(resp) {
    if (!resp) {
      callback("Failed to decrypt string", null)
    } else if (resp[0]) {
      callback(resp[0], null)
    } else {
      callback(null, resp[1])
    }
  })
};

module.exports = {
  uuid: uuid,
  time: time,
  getUserDataPath: getUserDataPath,
  authRequest: authRequest,
  WaitGroup: WaitGroup,
  encryptString: encryptString,
  decryptString: decryptString
};
