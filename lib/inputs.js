var Promise = require('es6-promise').Promise;
var axios = require('axios');
var config = require('./config');
var token = require('./token');
var request = require('./request');
var response = require('./response');

var path = '/v2/inputs';

module.exports.add = function(media, options) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return addRequest(media, options, tokenString);
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

function addRequest(media, options, tokenString) {
  var headers = request.getHeaders(tokenString);
  var url = config.get('apiEndpoint') + path;
  var data = {
    'inputs': media.map(formatImageOnAddRequest)
  };
  return axios({
    'method': 'post',
    'url': url,
    'data': data,
    'headers': headers
  });
}

function formatImageOnAddRequest(input) {
  var formattedInput = {
    'data': {
      'image': {
        'url': input['url'],
        'base64': input['base64'],
        'crop': input['crop']
      },
      'concepts': input['concepts']
    },
    'id': input['inputID'] || null
  };
  return formattedInput;
}

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
      url = url + '/' + params.id;
    }
  }
  return axios.get(url, options);
}

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
}

module.exports.updateById = function(id, concepts, action) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return updateRequest(id, concepts, action, tokenString);
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

module.exports.updateConcepts = function(inputs, action) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return updateRequest(null, inputs, action, tokenString);
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

function updateRequest(id, data, action, tokenString) {
  var url = config.get('apiEndpoint') + path;
  var data = {
    'action': action
  };
  if (id) {
    url = url + '/' + id + '/data/concepts';
    data['concepts'] = data;
  } else {
    data['inputs'] = data.map(formatInputOnUpdateRequest);
  }

  var headers = request.getHeaders(tokenString);
  return axios({
    'method': 'patch',
    'url': url,
    'data': data,
    'headers': headers
  });
}

function formatInputOnUpdateRequest(input) {
  return {
    "id": input.id,
    "data": {
      "concepts": input.concepts
    }
  };
}

module.exports.delete = function(id) {
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
  var url = config.get('apiEndpoint') + path;
  var options = {
    'headers': request.getHeaders(tokenString)
  };
  if (id) {
    url = url + '/' + id;
  }
  return axios.delete(url, options);
}
