var Promise = require('es6-promise').Promise;
var axios = require('axios');
var config = require('./config');
var request = require('./request');

var path = '/v2/token';

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
    postRequest().then(
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
};

function postRequest() {
  var url = config.get('apiEndpoint') + path;
  var clientId = config.get('clientId');
  var clientSecret = config.get('clientSecret');
  return axios.post(url, null, {
    'auth': {
      'username': clientId,
      'password': clientSecret
    },
    'transformRequest': [
      function() { 
        return request.transformDataToParams({
          'grant_type': 'client_credentials'
        }); 
      }
    ]
  });
};

// todo (dk) add retry https://www.npmjs.com/package/retry