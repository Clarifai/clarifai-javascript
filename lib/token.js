var Promise = require('es6-promise').Promise;
var axios = require('axios');
var config = require('./config');
var request = require('./request');

module.exports.get = function() {
  return new Promise(executor);
};

module.exports.set = function(_token) {
  var token = _token;
  if (typeof _token === 'string') {
    token = {
      'access_token': _token,
      'expires_in': 176400
    };
  }
  if (token.access_token && token.expires_in) {
    setExpireTime(token);
    config.set('token', token);
    return true;
  }
  return false;
};

module.exports.delete = function() {
  config.delete('token');
};

function executor(resolve, reject) {
  var now = new Date().getTime();
  var tokenFromConfig = config.get('token');
  if ( tokenFromConfig !== undefined &&  tokenFromConfig.expireTime > now ) {
    resolve(tokenFromConfig.access_token);
  } else {
    getRequest().then(
      function(response) {
        if ( response.status === 200 ) {
          var token = response.data;
          setExpireTime(token);
          config.set('token', token);
          resolve(token.access_token);
        } else {
          reject(response);
        }
      },
      reject
    );
  }
};

function setExpireTime(token) {
  var now = new Date().getTime();
  token.expireTime = now + (token.expires_in * 1000);
}

function getRequest() {
  var url = config.get('apiEndpoint') + '/v1/token';
  var data = getData();
  return axios.post(url, data, {
    'transformRequest': [
      function() { 
        return request.transformDataToParams(data); 
      }
    ]
  });
};

function getData() {
  var clientId = config.get('clientId');
  var clientSecret = config.get('clientSecret');
  return {
    'grant_type': 'client_credentials',
    'client_id': clientId,
    'client_secret': clientSecret
  };
};

// todo (dk) add retry https://www.npmjs.com/package/retry