var Promise = require('es6-promise').Promise;
var axios = require('axios');
var config = require('./config');
var token = require('./token');
var request = require('./request');
var response = require('./response');
var FormData = require('form-data');

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

module.exports.search = function(query, pagination) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return searchRequest(query, pagination, tokenString);
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

function searchRequest(query, pagination, tokenString) {
  var url = config.get('apiEndpoint') + path + '/searches';
  if ( query !== null && query !== undefined ) {
    query = request.fillOptionalData({}, query);
  };
  if ( pagination !== null && pagination !== undefined ) {
    pagination = request.fillOptionalData({}, pagination);
  };
  var data = {
    'query': query,
    'pagination': pagination
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

module.exports.addFile = function(file) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return addFileRequest(file, tokenString);
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

function addFileRequest(file, tokenString) {
  var url = config.get('apiEndpoint') + path + '/file';
  var formData = new FormData();
  var fileType = 'none';
  if (file.type !== undefined) {
    fileType = file.type.indexOf('csv') !== -1 ? 'csv' : 'tsv';
  };
  if (file.path !== undefined) {
    fileType = file.path.indexOf('csv') !== -1 ? 'csv' : 'tsv';
  };
  formData.append(fileType, file);
  var headers = request.getHeaders(tokenString);
  headers['content-type'] = 'multipart/form-data';
  return axios({
    'method': 'post',
    'url': url,
    'data': formData,
    'headers': headers
  });
};

// todo (dk) support localId