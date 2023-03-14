var os = require('os');
var request = require('request');
var constants = require('./constants.js');
var logger = require('./logger.js');
var config = require('./config.js');
var errors = require('./errors.js');

var profiles = [];
var profilesId = {};

var onUpdate = function(data) {
  for (var id in profilesId) {
    profilesId[id].update(data[id] || {
      'status': 'disconnected',
      'timestamp': null,
      'server_addr': null,
      'client_addr': null
    });
  }
};

var add = function(prfl) {
  profiles.push(prfl);
  profilesId[prfl.id] = prfl;
};

var remove = function(prfl) {
  delete profilesId[prfl.id];
  profiles.splice(profiles.indexOf(prfl));
};

var get = function(id) {
  return profilesId[id];
};

var iter = function(callback) {
  for (var i = 0; i < profiles.length; i++) {
    callback(profiles[i]);
  }
};

var update = function(callback) {
  var url;
  var headers = {
    'Auth-Key': constants.key,
    'User-Agent': 'pritunl'
  };

  if (constants.unixSocket) {
    url = 'http://unix:' + constants.unixPath + ':/profile';
    headers['Host'] = 'unix';
  } else {
    url = 'http://' + constants.serviceHost + '/profile';
  }

  request.get({
    url: url,
    headers: headers
  }, function(err, resp, body) {
    if (!err && resp && resp.statusCode !== 200) {
      err = resp.statusMessage;
    }

    if (err) {
      err = new errors.NetworkError(
        'service: Failed to update profile (%s)', err);
    } else {
      try {
        var data = JSON.parse(body);
      } catch (e) {
        err = new errors.ParseError(
          'service: Failed to parse data (%s)', e);
        logger.error(err);
      }

      if (!err) {
        onUpdate(data);
      }
    }

    if (callback) {
      callback(err);
    }
  }.bind(this));
};

var start = function(prfl, mode, timeout, serverPubKey, serverBoxPubKey,
    username, password, callback) {
  var reconnect = prfl.disableReconnect ? false :
    !config.settings.disable_reconnect;

  if (prfl.systemPrfl) {
    var url;
    var headers = {
      'Auth-Key': constants.key,
      'User-Agent': 'pritunl'
    };

    if (constants.unixSocket) {
      url = 'http://unix:' + constants.unixPath + ':/profile';
      headers['Host'] = 'unix';
    } else {
      url = 'http://' + constants.serviceHost + '/profile';
    }

    request.post({
      url: url,
      json: true,
      headers: headers,
      body: {
        id: prfl.id,
        mode: mode,
        org_id: prfl.organizationId,
        user_id: prfl.userId,
        server_id: prfl.serverId,
        sync_hosts: prfl.syncHosts,
        sync_token: prfl.syncToken,
        sync_secret: prfl.syncSecret,
        username: username,
        password: password,
        token_ttl: prfl.tokenTtl,
        reconnect: reconnect,
        timeout: timeout
      }
    }, function(err, resp, data) {
      if (!err && resp && resp.statusCode !== 200) {
        err = resp.statusMessage;
      }

      if (err) {
        err = new errors.NetworkError(
          'service: Failed to start profile (%s)', err);
        logger.error(err);
      }
      if (callback) {
        callback(err);
      }
    });

    return;
  }

  username = username || 'pritunl';

  if (serverPubKey) {
    serverPubKey = serverPubKey.join('\n');
  } else {
    serverPubKey = null;
    serverBoxPubKey = null;
  }

  prfl.getFullData(function(data) {
    var url;
    var headers = {
      'Auth-Key': constants.key,
      'User-Agent': 'pritunl'
    };

    if (constants.unixSocket) {
      url = 'http://unix:' + constants.unixPath + ':/profile';
      headers['Host'] = 'unix';
    } else {
      url = 'http://' + constants.serviceHost + '/profile';
    }

    request.post({
      url: url,
      json: true,
      headers: headers,
      body: {
        id: prfl.id,
        mode: mode,
        org_id: prfl.organizationId,
        user_id: prfl.userId,
        server_id: prfl.serverId,
        sync_hosts: prfl.syncHosts,
        sync_token: prfl.syncToken,
        sync_secret: prfl.syncSecret,
        username: username,
        password: password,
        dynamic_firewall: prfl.dynamicFirewall,
        device_auth: prfl.deviceAuth,
        sso_auth: prfl.ssoAuth,
        server_public_key: serverPubKey,
        server_box_public_key: serverBoxPubKey,
        token_ttl: prfl.tokenTtl,
        reconnect: reconnect,
        timeout: timeout,
        data: data
      }
    }, function(err, resp, data) {
      if (!err && resp && resp.statusCode !== 200) {
        err = resp.statusMessage;
      }

      if (err) {
        err = new errors.NetworkError(
          'service: Failed to start profile (%s)', err);
        logger.error(err);
      }
      if (callback) {
        callback(err);
      }
    });
  });
};

var stop = function(prfl, callback) {
  var url;
  var headers = {
    'Auth-Key': constants.key,
    'User-Agent': 'pritunl'
  };

  if (constants.unixSocket) {
    url = 'http://unix:' + constants.unixPath + ':/profile';
    headers['Host'] = 'unix';
  } else {
    url = 'http://' + constants.serviceHost + '/profile';
  }

  request.del({
    url: url,
    json: true,
    headers: headers,
    body: {
      id: prfl.id
    }
  }, function(err, resp, data) {
    if (!err && resp && resp.statusCode !== 200) {
      err = resp.statusMessage;
    }

    if (err) {
      err = new errors.NetworkError(
        'service: Failed to stop profile (%s)', err);
      logger.error(err);
    }
    if (callback) {
      callback(err);
    }
  });
};

var sprofilesGet = function(callback) {
  var url;
  var headers = {
    'Auth-Key': constants.key,
    'User-Agent': 'pritunl'
  };

  if (constants.unixSocket) {
    url = 'http://unix:' + constants.unixPath + ':/sprofile';
    headers['Host'] = 'unix';
  } else {
    url = 'http://' + constants.serviceHost + '/sprofile';
  }

  request.get({
    url: url,
    headers: headers
  }, function(err, resp, body) {
    if (!err && resp && resp.statusCode !== 200) {
      err = resp.statusMessage;
    }

    if (err) {
      err = new errors.NetworkError(
        'service: Failed to get sprofile (%s)', err);
    } else {
      try {
        var data = JSON.parse(body);
      } catch (e) {
        err = new errors.ParseError(
          'service: Failed to parse data (%s)', e);
        logger.error(err);
      }
    }

    if (callback) {
      callback(data, err);
    }
  }.bind(this));
};

var sprofilePut = function(data, callback) {
  var url;
  var headers = {
    'Auth-Key': constants.key,
    'User-Agent': 'pritunl'
  };

  if (constants.unixSocket) {
    url = 'http://unix:' + constants.unixPath + ':/sprofile';
    headers['Host'] = 'unix';
  } else {
    url = 'http://' + constants.serviceHost + '/sprofile';
  }

  request.put({
    url: url,
    json: true,
    headers: headers,
    body: data
  }, function(err, resp, body) {
    if (!err && resp && resp.statusCode !== 200) {
      err = resp.statusMessage;
    }

    if (err) {
      err = new errors.NetworkError(
        'service: Failed to update sprofile (%s)', err);
      logger.error(err);
    }

    if (callback) {
      callback(null, body.valid ? body : null);
    }
  });
};

var sprofileDel = function(prflId, callback) {
  var url;
  var headers = {
    'Auth-Key': constants.key,
    'User-Agent': 'pritunl'
  };

  if (constants.unixSocket) {
    url = 'http://unix:' + constants.unixPath + ':/sprofile';
    headers['Host'] = 'unix';
  } else {
    url = 'http://' + constants.serviceHost + '/sprofile';
  }

  request.del({
    url: url,
    json: true,
    headers: headers,
    body: {
      id: prflId
    }
  }, function(err, resp, data) {
    if (!err && resp && resp.statusCode !== 200) {
      err = resp.statusMessage;
    }

    if (err) {
      err = new errors.NetworkError(
        'service: Failed to delete sprofile (%s)', err);
      logger.error(err);
    }
    if (callback) {
      callback(err);
    }
  });
};

var sprofileLogGet = function(prflId, callback) {
  var url;
  var headers = {
    'Auth-Key': constants.key,
    'User-Agent': 'pritunl'
  };

  if (constants.unixSocket) {
    url = 'http://unix:' + constants.unixPath +
      ':/sprofile/' + prflId + '/log';
    headers['Host'] = 'unix';
  } else {
    url = 'http://' + constants.serviceHost +
      '/sprofile/' + prflId + '/log';
  }

  request.get({
    url: url,
    headers: headers,
  }, function(err, resp, data) {
    if (!err && resp && resp.statusCode !== 200) {
      err = resp.statusMessage;
    }

    if (err) {
      err = new errors.NetworkError(
        'service: Failed to get logs (%s)', err);
      logger.error(err);
    }
    if (callback) {
      callback(null, data);
    }
  });
};

var sprofileLogDel = function(prflId, callback) {
  var url;
  var headers = {
    'Auth-Key': constants.key,
    'User-Agent': 'pritunl'
  };

  if (constants.unixSocket) {
    url = 'http://unix:' + constants.unixPath +
      ':/sprofile/' + prflId + '/log';
    headers['Host'] = 'unix';
  } else {
    url = 'http://' + constants.serviceHost +
      '/sprofile/' + prflId + '/log';
  }

  request.del({
    url: url,
    headers: headers,
  }, function(err, resp, data) {
    if (!err && resp && resp.statusCode !== 200) {
      err = resp.statusMessage;
    }

    if (err) {
      err = new errors.NetworkError(
        'service: Failed to delete logs (%s)', err);
      logger.error(err);
    }
    if (callback) {
      callback(err);
    }
  });
};

var tokenUpdate = function(prfl, callback) {
  var serverPubKey = '';

  if (prfl.serverPublicKey) {
    serverPubKey = prfl.serverPublicKey.join('\n');
  } else {
    serverPubKey = null;
  }

  var url;
  var headers = {
    'Auth-Key': constants.key,
    'User-Agent': 'pritunl'
  };

  if (constants.unixSocket) {
    url = 'http://unix:' + constants.unixPath + ':/token';
    headers['Host'] = 'unix';
  } else {
    url = 'http://' + constants.serviceHost + '/token';
  }

  request.put({
    url: url,
    json: true,
    headers: headers,
    body: {
      profile: prfl.id,
      server_public_key: serverPubKey,
      server_box_public_key: prfl.serverBoxPublicKey,
      ttl: prfl.tokenTtl,
    }
  }, function(err, resp, body) {
    if (!err && resp && resp.statusCode !== 200) {
      err = resp.statusMessage;
    }

    if (err) {
      err = new errors.NetworkError(
        'service: Failed to update token (%s)', err);
      logger.error(err);
    } else {
      if (callback) {
        callback(null, body.valid);
      }
      return;
    }

    if (callback) {
      callback(err);
    }
  });
};

var tokenDelete = function(prfl, callback) {
  var url;
  var headers = {
    'Auth-Key': constants.key,
    'User-Agent': 'pritunl'
  };

  if (constants.unixSocket) {
    url = 'http://unix:' + constants.unixPath + ':/token';
    headers['Host'] = 'unix';
  } else {
    url = 'http://' + constants.serviceHost + '/token';
  }

  request.del({
    url: url,
    json: true,
    headers: headers,
    body: {
      profile: prfl.id
    }
  }, function(err, resp, data) {
    if (!err && resp && resp.statusCode !== 200) {
      err = resp.statusMessage;
    }

    if (err) {
      err = new errors.NetworkError(
        'service: Failed to delete token (%s)', err);
      logger.error(err);
    }
    if (callback) {
      callback(err);
    }
  });
};

var ping = function(callback) {
  var url;
  var headers = {
    'Auth-Key': constants.key,
    'User-Agent': 'pritunl'
  };

  if (constants.unixSocket) {
    url = 'http://unix:' + constants.unixPath + ':/ping';
    headers['Host'] = 'unix';
  } else {
    url = 'http://' + constants.serviceHost + '/ping';
  }

  request.get({
    url: url,
    headers: headers
  }, function(err, resp) {
    var statusCode = resp ? resp.statusCode : null;
    if (err || statusCode !== 200) {
      callback(false, statusCode);
    } else {
      callback(true, statusCode);
    }
  });
};

var wakeup = function(callback) {
  var url;
  var headers = {
    'Auth-Key': constants.key,
    'User-Agent': 'pritunl'
  };

  if (constants.unixSocket) {
    url = 'http://unix:' + constants.unixPath + ':/wakeup';
    headers['Host'] = 'unix';
  } else {
    url = 'http://' + constants.serviceHost + '/wakeup';
  }

  request.post({
    url: url,
    headers: headers
  }, function(err, resp) {
    var statusCode = resp ? resp.statusCode : null;
    if (err || statusCode !== 200) {
      callback(false, statusCode);
    } else {
      callback(true, statusCode);
    }
  });
};

var state = function(callback) {
  var url;
  var headers = {
    'Auth-Key': constants.key,
    'User-Agent': 'pritunl'
  };

  if (constants.unixSocket) {
    url = 'http://unix:' + constants.unixPath + ':/state';
    headers['Host'] = 'unix';
  } else {
    url = 'http://' + constants.serviceHost + '/state';
  }

  request.get({
    url: url,
    headers: headers,
  }, function(err, resp, body) {
    if (!err && resp && resp.statusCode !== 200) {
      err = resp.statusMessage;
    }

    if (err) {
      err = new errors.NetworkError(
        'service: Failed to get state (%s)', err);
      logger.error(err);
    } else {
      try {
        var data = JSON.parse(body);
      } catch (e) {
        err = new errors.NetworkError(
          'service: Failed to get state (%s)', err);
        logger.error(err);
      }

      if (!err) {
        if (callback) {
          callback(null, data);
        }
        return;
      }
    }

    if (callback) {
      callback(err);
    }
  });
};

module.exports = {
  add: add,
  remove: remove,
  get: get,
  iter: iter,
  update: update,
  sprofilesGet: sprofilesGet,
  sprofilePut: sprofilePut,
  sprofileDel: sprofileDel,
  sprofileLogGet: sprofileLogGet,
  sprofileLogDel: sprofileLogDel,
  tokenUpdate: tokenUpdate,
  tokenDelete: tokenDelete,
  start: start,
  stop: stop,
  ping: ping,
  wakeup: wakeup,
  state: state
};
