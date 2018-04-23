let Promise = require('promise');
let validUrl = require('valid-url');
let {GEO_LIMIT_TYPES, ERRORS} = require('./constants');
let {checkType, clone} = require('./helpers');
let {version: VERSION} = require('./../package.json');

module.exports = {
  wrapToken: (_config, requestFn) => {
    return new Promise((resolve, reject) => {
      if (_config.apiKey) {
        let headers = {
          Authorization: `Key ${_config.apiKey}`,
          'X-Clarifai-Client': `js:${VERSION}`
        };
        return requestFn(headers).then(resolve, reject);
      }
      if (_config.sessionToken) {
        let headers = {
          'X-Clarifai-Session-Token': _config.sessionToken,
          'X-Clarifai-Client': `js:${VERSION}`
        };
        return requestFn(headers).then(resolve, reject);
      }
      _config.token().then((token) => {
        let headers = {
          Authorization: `Bearer ${token.accessToken}`,
          'X-Clarifai-Client': `js:${VERSION}`
        };
        requestFn(headers).then(resolve, reject);
      }, reject);
    });
  },
  formatModel: (data = {}) => {
    let formatted = {};
    if (data.id === null || data.id === undefined) {
      throw ERRORS.paramsRequired('Model ID');
    }
    formatted.id = data.id;
    if (data.name) {
      formatted.name = data.name;
    }
    formatted.output_info = {};
    if (data.conceptsMutuallyExclusive !== undefined) {
      formatted.output_info.output_config = formatted.output_info.output_config || {};
      formatted.output_info.output_config.concepts_mutually_exclusive = !!data.conceptsMutuallyExclusive;
    }
    if (data.closedEnvironment !== undefined) {
      formatted.output_info.output_config = formatted.output_info.output_config || {};
      formatted.output_info.output_config.closed_environment = !!data.closedEnvironment;
    }
    if (data.concepts) {
      formatted.output_info.data = {
        concepts: data.concepts.map(module.exports.formatConcept)
      };
    }
    return formatted;
  },
  formatInput: (data, includeImage) => {
    let input = checkType(/String/, data) ?
      {url: data} :
      data;
    let formatted = {
      id: input.id || null,
      data: {}
    };
    if (input.concepts) {
      formatted.data.concepts = input.concepts;
    }
    if (input.metadata) {
      formatted.data.metadata = input.metadata;
    }
    if (input.geo) {
      formatted.data.geo = {geo_point: input.geo};
    }
    if (input.regions) {
      formatted.data.regions = input.regions;
    }
    if (includeImage !== false) {
      formatted.data.image = {
        url: input.url,
        base64: input.base64,
        crop: input.crop
      };
      if (data.allowDuplicateUrl) {
        formatted.data.image.allow_duplicate_url = true;
      }
    }
    return formatted;
  },
  formatMediaPredict: (data, type = 'image') => {
    let media;
    if (checkType(/String/, data)) {
      if (validUrl.isWebUri(data)) {
        media = {
          url: data
        };
      } else {
        media = {
          base64: data
        };
      }
    } else {
      media = Object.assign({}, data);
    }

    // Users can specify their own id to distinguish batch results
    let id;
    if (media.id) {
      id = media.id;
      delete media.id;
    }

    let object = {
      data: {
        [type]: media
      }
    };

    if (id) {
      object.id = id;
    }

    return object;
  },
  formatImagesSearch: (image) => {
    let imageQuery;
    let input = {input: {data: {}}};
    let formatted = [];
    if (checkType(/String/, image)) {
      imageQuery = {url: image};
    } else {
      imageQuery = (image.url || image.base64) ? {
        image: {
          url: image.url,
          base64: image.base64,
          crop: image.crop
        }
      } : {};
    }

    input.input.data = imageQuery;
    if (image.id) {
      input.input.id = image.id;
      input.input.data = {image: {}};
      if(image.crop) {
        input.input.data.image.crop = image.crop;
      }
    }
    if (image.metadata !== undefined) {
      input.input.data.metadata = image.metadata;
    }
    if (image.geo !== undefined) {
      if (checkType(/Array/, image.geo)) {
        input.input.data.geo = {
          geo_box: image.geo.map(p => {
            return {geo_point: p};
          })
        };
      } else if (checkType(/Object/, image.geo)) {
        if (GEO_LIMIT_TYPES.indexOf(image.geo.type) === -1) {
          throw ERRORS.INVALID_GEOLIMIT_TYPE;
        }
        input.input.data.geo = {
          geo_point: {
            latitude: image.geo.latitude,
            longitude: image.geo.longitude
          },
          geo_limit: {
            type: image.geo.type,
            value: image.geo.value
          }
        };
      }
    }
    if (image.type !== 'input' && input.input.data.image) {
      if (input.input.data.metadata || input.input.data.geo) {
        let dataCopy = {input: {data: clone(input.input.data)}};
        let imageCopy = {input: {data: clone(input.input.data)}};
        delete dataCopy.input.data.image;
        delete imageCopy.input.data.metadata;
        delete imageCopy.input.data.geo;
        input = [
          {output: imageCopy},
          dataCopy
        ];
      } else {
        input = [{output: input}];
      }
    }
    formatted = formatted.concat(input);
    return formatted;
  },
  formatConcept: (concept) => {
    let formatted = concept;
    if (checkType(/String/, concept)) {
      formatted = {
        id: concept
      };
    }
    return formatted;
  },
  formatConceptsSearch: (query) => {
    if (checkType(/String/, query)) {
      query = {id: query};
    }
    let v = {};
    let type = query.type === 'input' ? 'input' : 'output';
    delete query.type;
    v[type] = {
      data: {
        concepts: [query]
      }
    };
    return v;
  },
  formatObjectForSnakeCase(obj) {
    return Object.keys(obj).reduce((o, k) => {
      o[k.replace(/([A-Z])/g, r => '_'+r.toLowerCase())] = obj[k];
      return o;
    }, {});
  }
};
