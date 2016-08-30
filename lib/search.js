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
  var ands = [];
  var data = {
    'headers': request.getHeaders(tokenString)
  };

  if (images && images.length) {
    ands = ands.concat(images.map(formatImagesOnSearchRequest));
  }

  if (tags.ands) {
    ands = ands.concat(formatQueryOnSearchRequest(tags.ands));
  }

  if (tags.ors) {
    ands = ands.concat({
      'ors': formatQueryOnSearchRequest(tags.ors)
    });
  }

  data.data = {
    'query': {
      'ands': ands
    }
  };

  if (options.page || options.perPage) {
    data.data['pagination'] = {
      'page': options.page,
      'per_page': options.perPage
    }
  }

  return axios.post(url, data);
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
            'value': query.value || true
          }
        ]
      }
    }
  };
}
