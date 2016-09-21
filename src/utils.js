let {Promise} = require('es6-promise');
let {URL_REGEX} = require('./constants');

module.exports = {
  wrapToken: (_config, requestFn)=> {
    return new Promise((resolve, reject)=> {
      _config.token().then((token)=> {
        let headers = {
          'Authorization': `Bearer ${token['access_token']}`
        };
        requestFn(headers).then(resolve, reject);
      }, reject);
    });
  },
  formatInput: (data, includeImage)=> {
    let input = /(String)/.test(Object.prototype.toString.call(data))?
      { 'url': data }:
      data;
    let formatted = {
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
    }
    return formatted;
  },
  formatImagePredict: (data)=> {
    let image = data;
    if (/(String)/.test(Object.prototype.toString.call(data))) {
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
        image
      }
    };
  },
  formatImagesSearch: (image)=> {
    let imageQuery;
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

    let input = {
      'input': {
        'data': {
          'image': imageQuery
        }
      }
    };
    return image.type === 'input'?
      input: {
        'output': input
      };
  },
  formatConceptsSearch: (query)=> {
    if (/(String)/.test(Object.prototype.toString.call(query))) {
      query = {name: query};
    }
    let v =  {};
    let type = query.type === 'input'? 'input': 'output';
    v[type] = {
      'data': {
        'concepts': [
          {
            'name': query.name,
            'value': query.value === undefined? true: !!query.value
          }
        ]
      }
    };
    return v;
  }
};
