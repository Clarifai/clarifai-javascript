let axios = require('axios');
let {API} = require('./constants');
let {INPUTS_PATH} = API;

/**
* class representing an input
* @class
*/
class Input {
  constructor(_config, data) {
    this.id = data.id;
    this.createdAt = data.created_at || data.createdAt;
    this.imageUrl = data.data.image.url;
    this.score = data.score;
    this._config = _config;
    this._rawData = data;
  }
  /**
  * Returns a javascript object with the raw data attributes (from API)
  * @return {object} An object that contains data about input from api
  */
  toObject() {
    return this._rawData;
  }
  /**
  * Merge concepts to an input
  * @param {object[]}         concepts    Object with keys explained below:
  *   @param {object}           concepts[].concept
  *     @param {string}           concepts[].concept.id        The concept id (required)
  *     @param {boolean}          concepts[].concept.value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @return {Promise(input, error)} A Promise that is fulfilled with an instance of Input or rejected with an error
  */
  mergeConcepts(concepts) {
    return this._update('merge_concepts', concepts);
  }
  /**
  * Delete concept to an input
  * @param {object[]}         concepts    Object with keys explained below:
  *   @param {object}           concepts[].concept
  *     @param {string}           concepts[].concept.id        The concept id (required)
  *     @param {boolean}          concepts[].concept.value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @return {Promise(input, error)} A Promise that is fulfilled with an instance of Input or rejected with an error
  */
  deleteConcepts(concepts) {
    return this._update('delete_concepts', concepts);
  }
  _update(concepts) {
    let url = `${this._config.apiEndpoint}${INPUTS_PATH}`;
    let data = {
      action,
      inputs: [
        {
          id: this.id,
          data: { concepts }
        }
      ]
    };
    return wrapToken(this._config, (headers)=> {
      return new Promise((resolve, reject)=> {
        return axios.patch(url, data, {headers})
        .then((response)=> {
          if (isSuccess(response)) {
            resolve(new Input(response.data.input));
          } else {
            reject(response);
          }
        }, reject);
      });
    });
  }
};

module.exports = Input;
