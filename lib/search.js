var Promise = require('es6-promise').Promise;
var axios = require('axios');
var config = require('./config');
var token = require('./token');
var request = require('./request');
var response = require('./response');

var path = '/v2/searches';

module.exports.searchInputs = function(queries, options) {
  return new Promise(function(resolve, reject) {
    token.get().then(
      function(tokenString) {
        return searchRequest(queries, options, tokenString);
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

function searchRequest(queries = {}, options = {}, tokenString) {
  var url = config.get('apiEndpoint') + path;
  var data = {};
  var ands = [];

  if (queries && queries.ands && queries.ands.length > 0) {
    ands = ands.concat(queries.ands.map(function(andQuery) {
      var formattedQuery;
      if (andQuery.term) {
        formattedQuery = formatConceptOnSearchRequest(andQuery);
      } else {
        formattedQuery = formatImagesOnSearchRequest(andQuery);
      }
      return formattedQuery;
    }));
  }

  if (queries && queries.ors && queries.ors.length > 0) {
    ands = ands.concat({
      'ors': queries.ors.map(function(orQuery) {
        let formattedQuery;
        if (orQuery.term) {
          formattedQuery = formatConceptOnSearchRequest(orQuery);
        } else {
          formattedQuery = formatImagesOnSearchRequest(orQuery);
        }
        return formattedQuery;
      })
    });
  }

  data['query'] = {
    'ands': ands
  };

  if (options && (options.page || options.perPage)) {
    data['pagination'] = {
      'page': options.page,
      'per_page': options.perPage
    };
  }

  return axios.post(url, data, {
    'headers': request.getHeaders(tokenString)
  });
}

function formatImagesOnSearchRequest(image) {
  var imageQuery;
  if (typeof image === 'string') {
    imageQuery = {
      'url': image
    };
  } else {
    imageQuery = {
      'url': image['url'] || null,
      'base64': image['base64'] || null,
      'crop': image['crop'] || null
    };
  }

  return {
    'output': {
      'input': {
        'data': {
          'image': imageQuery
        }
      }
    }
  };
}

function formatConceptOnSearchRequest(query) {
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
