var Promise = require('es6-promise').Promise;
var axios = require('axios');
var config = require('./config');
var token = require('./token');
var request = require('./request');
var response = require('./response');
var FormData = require('form-data');

var path = '/v2/inputs';

module.exports.add = function(options) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return addRequest(options, tokenString);
      }
    ).then(
      function (_response) {
        response.handleV2(_response, resolve, reject);
      }
    ).catch(
      function(err){
        response.errorV2(err, reject);
      }
    );
  });
};

function addRequest(inputs, tokenString) {
  var url = config.get('apiEndpoint') + path;
  if ( inputs.length === undefined ) {
    inputs = [inputs];
  };
  var data = {
    'inputs': inputs
  };
  var headers = request.getHeaders(tokenString);
  return axios({
    'method': 'post',
    'url': url,
    'data': data,
    'headers': headers
  });
};