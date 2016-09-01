var Promise = require('es6-promise').Promise;
var axios = require('axios');
var config = require('./config');
var token = require('./token');
var request = require('./request');
var response = require('./response');

var path = '/v2/searches';

module.exports.searchInputs = function(images, tags, options) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return searchRequest(images, tags, options, tokenString);
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

function searchRequest(images, tags, options, tokenString) {
  var url = config.get('apiEndpoint') + path;
  var data = {};
  var ands = [];

  if (images && images.length) {
    ands = ands.concat(images.map(formatImagesOnSearchRequest));
  }

  if (tags && tags.ands && tags.ands.length > 0) {
    ands = ands.concat(tags.ands.map(formatQueryOnSearchRequest));
  }

  if (tags && tags.ors && tags.ors.length > 0) {
    ands = ands.concat({
      'ors': tags.ors.map(formatQueryOnSearchRequest)
    });
  }

  data['query'] = {
    'ands': ands
  };

  if (options && (options.page || options.perPage)) {
    data['pagination'] = {
      'page': options.page,
      'per_page': options.perPage
    }
  }

  return axios.post(url, data, {
    'headers': request.getHeaders(tokenString)
  });
}

function formatImagesOnSearchRequest(image) {
  var image;
  if (typeof image === 'string') {
    image = {
      url: image,
    }
  } else {
    image = {
      url: image.url || [],
      crop: image.crop || []
    }
  }

  return {
    'output': {
      'input': {
        'data': {
          'image': image
        }
      }
    }
  };
}

function formatQueryOnSearchRequest(query) {
  return {
    'output': {
      'data': {
        'concepts': [
          {
            'name': query.term,
            'value': (query.value === undefined? true: !!query.value)
          }
        ]
      }
    }
  };
}
