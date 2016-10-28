'use strict';

var fs = require('fs');

var _require = require('es6-promise');

var Promise = _require.Promise;

var _require2 = require('./constants');

var URL_REGEX = _require2.URL_REGEX;

var _require3 = require('./helpers');

var checkType = _require3.checkType;

var path = void 0;
try {
  fs.accessSync('../package.json', fs.F_OK);
  path = '../package.json';
} catch (e) {
  path = '../../package.json';
}
var VERSION = require(path).version;

module.exports = {
  wrapToken: function wrapToken(_config, requestFn) {
    return new Promise(function (resolve, reject) {
      _config.token().then(function (token) {
        var headers = {
          'Authorization': 'Bearer ' + token['access_token'],
          'X-Clarifai-Client': 'js:' + VERSION
        };
        requestFn(headers).then(resolve, reject);
      }, reject);
    });
  },
  formatModel: function formatModel(data) {
    var formatted = {};
    formatted.id = data.id;
    if (data.name) {
      formatted.name = data.name;
    }
    formatted['output_info'] = {};
    if (data.conceptsMutuallyExclusive !== undefined) {
      formatted['output_info']['output_config'] = formatted['output_info']['output_config'] || {};
      formatted['output_info']['output_config']['concepts_mutually_exclusive'] = !!data.conceptsMutuallyExclusive;
    }
    if (data.closedEnvironment !== undefined) {
      formatted['output_info']['output_config'] = formatted['output_info']['output_config'] || {};
      formatted['output_info']['output_config']['closed_environment'] = !!data.closedEnvironment;
    }
    if (data.concepts) {
      formatted['output_info']['data'] = {
        'concepts': data.concepts.map(module.exports.formatConcept)
      };
    }
    return formatted;
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
    if (input['metadata']) {
      formatted['data']['metadata'] = input['metadata'];
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
    var formatted = [];
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

    if (imageQuery.url || imageQuery.baseQuery) {
      var input = {
        'input': {
          'data': {
            'image': imageQuery
          }
        }
      };
      if (image.type !== 'input') {
        input = { 'output': input };
      }
      formatted.push(input);
    }

    if (image.metadata !== undefined) {
      formatted.push({
        'input': {
          'data': {
            'metadata': image.metadata
          }
        }
      });
    }

    return formatted;
  },
  formatConcept: function formatConcept(concept) {
    var formatted = concept;
    if (checkType(/String/, concept)) {
      formatted = {
        id: concept
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