var Promise = require('es6-promise').Promise;
var axios = require('axios');
var config = require('./config');
var token = require('./token');
var request = require('./request');
var response = require('./response');

var path = '/v1/info/languages';

module.exports.get = function() {
  return new Promise(executor);
};

function executor(resolve, reject) {
  token.get().then(
    function(tokenString) {
      return getRequest(tokenString);
    }
  ).then(
    function (_response) {
      response.handleV1(_response, resolve, reject); 
    }
  ).catch(
    function(err){
      response.errorV1(err, reject);
    }
  );
};

function getRequest(tokenString) {
  var url = config.get('apiEndpoint') + path;
  return axios.get(url, {
    'headers': request.getHeaders(tokenString),
  });
};