let axios = require('axios');
let {wrapToken} = require('../utils');
let {isSuccess, clone} = require('../helpers');

let BASE_URL = 'https://api.clarifai-moderation.com';

class Moderation {

  constructor(_config) {
    this._config = _config;

  }

  predict(modelID, imageURL) {
    return wrapToken(this._config, (headers) => {
      let url = `${BASE_URL}/v2/models/${modelID}/outputs`;
      let params = {
        inputs: [
          {
            data: {
              image: {
                url: imageURL
              }
            }
          }
        ]
      };

      return new Promise((resolve, reject) => {
        return axios.post(url, params, {headers}).then((response) => {
          if (isSuccess(response)) {
            let data = clone(response.data);
            resolve(data);
          } else {
            reject(response);
          }
        }, reject);
      });
    });
  }

  getModerationStatus(imageID) {
    return wrapToken(this._config, (headers) => {
      let url = `${BASE_URL}/v2/inputs/${imageID}/outputs`;
      return new Promise((resolve, reject) => {
        return axios.get(url, {headers}).then((response) => {
          let data = clone(response.data);
          resolve(data);
        }, reject);

      });
    });
  }
}

module.exports = Moderation;
