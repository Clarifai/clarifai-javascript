var Promise = require('es6-promise').Promise;
var axios = require('axios');
var config = require('./config');
var token = require('./token');
var request = require('./request');
var response = require('./response');

var path = '/v2/models';

module.exports.create = function(options) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return createRequest(options, tokenString);
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

function createRequest(options, tokenString) {
  var url = config.get('apiEndpoint') + path;
  var data = {
    'model': {
      'name': options.name,
      'input_info': {
        'image_input_info': {}
      },
      'output_info': {  
        'concept_output_info': {
          'concepts': options.concepts,
          'one_vs_all': false 
        }
      }
    }
  };
  var headers = request.getHeaders(tokenString);
  return axios({
    'method': 'post',
    'url': url,
    'data': data,
    'headers': headers
  });
};

