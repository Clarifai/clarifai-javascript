var Promise = require('es6-promise').Promise;
var axios = require('axios');
var config = require('./config');
var token = require('./token');
var request = require('./request');
var response = require('./response');

var path = '/v1/feedback';

module.exports.create = function(imageUrl, _options) {
  var options = _options || {};
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return createRequest(imageUrl, tokenString, options);
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
  });
};

function createRequest(imageUrl, tokenString, options) {
  var url = config.get('apiEndpoint') + path;
  var data = request.getImageUrlParams(imageUrl);
  data = request.fillOptionalParams(data, options);
  return axios.post(url, data, {
    'headers': request.getHeaders(tokenString)
  });
};