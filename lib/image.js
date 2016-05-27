var Promise = require('es6-promise').Promise;
var axios = require('axios');
var config = require('./config');
var token = require('./token');
var request = require('./request');
var response = require('./response');

var path = '/v2/images';

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

function addRequest(images, tokenString) {
  var url = config.get('apiEndpoint') + path;
  if ( images.length === undefined ) {
    images = [images];
  };
  var data = {
    'images': images
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

module.exports.search = function(options) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return searchRequest(options, tokenString);
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

function searchRequest(search, tokenString) {
  var url = config.get('apiEndpoint') + path + '/searches';
  if ( search !== null && data !== undefined ) {
    search = request.fillOptionalData({}, search);
  };
  var data = {
    'query': search
  };
  return axios({
    'method': 'post',
    'url': url,
    'data': data,
    'headers': request.getHeaders(tokenString)
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

module.exports.deleteById = function(id) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return deleteRequest(id, tokenString);
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

function deleteRequest(id, tokenString) {
  var url = config.get('apiEndpoint') + path + '/' + id;
  var options = {
    'headers': request.getHeaders(tokenString)
  };
  return axios.delete(url, options);
};

module.exports.getCount = function() {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return getCountRequest(tokenString);
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

function getCountRequest(tokenString) {
  var url = config.get('apiEndpoint') + path + '/count';
  var options = {
    'headers': request.getHeaders(tokenString)
  };
  return axios.get(url, options);
};

// todo (dk) support localId