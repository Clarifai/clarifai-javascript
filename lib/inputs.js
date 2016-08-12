var Promise = require('es6-promise').Promise;
var axios = require('axios');
var config = require('./config');
var token = require('./token');
var request = require('./request');
var response = require('./response');

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

module.exports.get = function(options) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return getRequest(options, tokenString);
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

module.exports.getById = function(id) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        var params = {
          'id': id
        };
        return getRequest(params, tokenString);
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

function getRequest(params, tokenString) {
  var url = config.get('apiEndpoint') + path;
  var options = {
    'headers': request.getHeaders(tokenString)
  };
  if ( params !== null && params !== undefined ) {
    options.params = request.fillOptionalParams({}, params);
    if ( params.id !== undefined ) {
      url = config.get('apiEndpoint') + path + '/' + params.id;
    }
  }
  return axios.get(url, options);
};

module.exports.getStatus = function() {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return getStatustRequest(tokenString);
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

function getStatustRequest(tokenString) {
  var url = config.get('apiEndpoint') + path + '/status';
  var options = {
    'headers': request.getHeaders(tokenString)
  };
  return axios.get(url, options);
};

module.exports.updateById = function(id, options) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return updateRequest(id, options, tokenString);
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

function updateRequest(id, input, tokenString) {
  var url = config.get('apiEndpoint') + path + '/' + id;
  console.log('url', url);
  input.id = id;
  var data = {
    'input': input
  };
  console.log(JSON.stringify(data, null, 2));
  var headers = request.getHeaders(tokenString);
  return axios({
    'method': 'patch',
    'url': url,
    'data': data,
    'headers': headers
  });
};