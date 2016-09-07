var Promise = require('es6-promise').Promise;
var axios = require('axios');
var config = require('./config');
var token = require('./token');
var request = require('./request');
var response = require('./response');

var path = '/v2/models';

module.exports.get = function(params, options) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return getRequest(params || {}, options || {}, tokenString);
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

function getRequest(params, options, tokenString) {
  var url = config.get('apiEndpoint') + path;
  var data = {
    'headers': request.getHeaders(tokenString)
  };

  data.params = params;
  if ( options.modelId !== undefined ) {
    url = url + '/' + options.modelId;
  } else if ( options.outputInfo === true ) {
    url = url + '/' + options.modelId + '/output_info';
  } else if ( options.versions === true ) {
    url = url + '/' + options.modelId + '/versions';
  } else if ( options.versionId !== undefined ) {
    url = url + '/' + options.modelId + '/versions/' + options.versionId;
  }
  return axios.get(url, data);
}

module.exports.create = function(name, conceptIds, options) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return createRequest(name, conceptIds, options, tokenString);
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

function createRequest(name, conceptIds, options, tokenString) {
  var headers = request.getHeaders(tokenString);
  var url = config.get('apiEndpoint') + path;
  var data = {
    'model': {
      'name': name,
      'output_info': {}
    }
  };
  if (conceptIds) {
    data['model']['output_info']['data'] = {
      'concepts': conceptIds
    };
  }
  if (options && options.oneVsAll !== undefined) {
    data['model']['output_info']['output_config'] = {
      'one_vs_all': options.oneVsAll
    };
  }
  return axios({
    'method': 'post',
    'url': url,
    'data': data,
    'headers': headers
  });
}

module.exports.updateConcepts = function(modelId, data) {
  var url = config.get('apiEndpoint') + path + '/' + modelId + '/output_info/data/concepts';
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return axios.patch(url, data);
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

module.exports.search = function(name, type, options) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return searchRequest(name, type, options);
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

function searchRequest(name, type, params) {
  var data = {
    'headers': request.getHeaders(tokenString)
  };
  data.params = params;
  return axios.get(url, data);
}

module.exports.createVersion = function(modelId) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return versionRequest(modelId, tokenString);
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

function versionRequest(modelId, tokenString) {
  var url = config.get('apiEndpoint') + path + '/' + modelId + '/versions';
  var headers = request.getHeaders(tokenString);
  return axios({
    'method': 'post',
    'url': url,
    'headers': headers
  });
}

module.exports.createOutputs = function(id, inputs) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return createOutputsRequest(id, inputs, tokenString);
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

function createOutputsRequest(id, inputs, tokenString) {
  var headers = request.getHeaders(tokenString);
  var url = config.get('apiEndpoint') + path;
  if (id.modelId) {
    if (id.versionId) {
      url = url + '/' + id.modelId + '/versions/' + id.versionId + '/outputs';
    } else {
      url = url + '/' + id.modelId + '/outputs';
    }
  } else {
    url = url + '/' + id + '/outputs';
  }

  var data = {
    'inputs': inputs.map(formatInputOnCreateOutputsRequest)
  };

  return axios({
    'method': 'post',
    'url': url,
    'data': data,
    'headers': headers
  });
}

function formatInputOnCreateOutputsRequest(input) {
  return {
    'data': {
      'image': {
        'url': input['url'],
        'base64': input['base64'],
        'crop': input['crop']
      }
    }
  };
}
