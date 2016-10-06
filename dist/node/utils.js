'use strict';

var _require = require('es6-promise');

var Promise = _require.Promise;

var _require2 = require('./constants');

var URL_REGEX = _require2.URL_REGEX;

var _require3 = require('./helpers');

var checkType = _require3.checkType;


module.exports = {
  wrapToken: function wrapToken(_config, requestFn) {
    return new Promise(function (resolve, reject) {
      _config.token().then(function (token) {
        var headers = {
          'Authorization': 'Bearer ' + token['access_token']
        };
        requestFn(headers).then(resolve, reject);
      }, reject);
    });
  },
  formatInput: function formatInput(data, includeImage) {
    var input = checkType(/String/, data) ? { 'url': data } : data;
    var formatted = {
      'id': input['id'] || null,
      'data': {}
    };
    if (input['concepts']) {
      formatted['data']['concepts'] = input['concepts'];
    }
    if (includeImage !== false) {
      formatted.data['image'] = {
        'url': input['url'],
        'base64': input['base64'],
        'crop': input['crop']
      };
      if (data.allowDuplicateUrl) {
        formatted.data.image['allow_duplicate_url'] = true;
      }
    }
    return formatted;
  },
  formatImagePredict: function formatImagePredict(data) {
    var image = data;
    if (checkType(/String/, data)) {
      if (URL_REGEX.test(image) === true) {
        image = {
          'url': data
        };
      } else {
        image = {
          'base64': data
        };
      }
    }
    return {
      'data': {
        image: image
      }
    };
  },
  formatImagesSearch: function formatImagesSearch(image) {
    var imageQuery = void 0;
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

    var input = {
      'input': {
        'data': {
          'image': imageQuery
        }
      }
    };
    return image.type === 'input' ? input : {
      'output': input
    };
  },
  formatConcept: function formatConcept(concept) {
    var formatted = concept;
    if (checkType(/String/, concept)) {
      formatted = {
        id: concept,
        name: concept
      };
    }
    return formatted;
  },
  formatConceptsSearch: function formatConceptsSearch(query) {
    if (checkType(/String/, query)) {
      query = { name: query };
    }
    var v = {};
    var type = query.type === 'input' ? 'input' : 'output';
    v[type] = {
      'data': {
        'concepts': [{
          'name': query.name,
          'value': query.value === undefined ? true : !!query.value
        }]
      }
    };
    return v;
  }
};