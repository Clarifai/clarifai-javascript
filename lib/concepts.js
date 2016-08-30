var Promise = require('es6-promise').Promise;
var axios = require('axios');
var config = require('./config');
var token = require('./token');
var request = require('./request');
var response = require('./response');

var path = '/v2/concepts';

module.exports.get = function(id, options) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return getRequest(id, options, tokenString);
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

function getRequest(id, options, tokenString) {
  var url = config.get('apiEndpoint') + path;
  if (id) {
    url = url + '/' + id;
  }
  var options = {
    'headers': request.getHeaders(tokenString),
    'params': options
  };
  return axios.post(url, options);
}

module.exports.add = function(concepts) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return addRequest(concepts, tokenString);
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

function addRequest(concepts, tokenString) {
  var url = config.get('apiEndpoint') + path + '/searches';
  var options = {
    'headers': request.getHeaders(tokenString),
    'data': {
      'concepts': concepts
    }
  };
  return axios.post(url, options);
}

module.exports.search = function(name, options) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return searchRequest(name, options, tokenString);
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

function searchRequest(name, options, tokenString) {
  var url = config.get('apiEndpoint') + path + '/searches';
  var options = {
    'headers': request.getHeaders(tokenString),
    'data': {
      'concept_query': {
        'name': name
      }
    }
  };
  return axios.post(url, options);
}
