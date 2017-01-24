let axios = require('axios');
let Concepts = require('./Concepts');
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
    this.concepts = new Concepts(_config, data.data.concepts);
    this.score = data.score;
    this.metadata = data.data.metadata;
    if (data.data.geo && data.data.geo['geo_point']) {
      this.geo = { geoPoint: data.data.geo['geo_point'] };
    }
    this.rawData = data;
    this._config = _config;
  }
  /**
  * Merge concepts to an input
  * @param {object[]}         concepts    Object with keys explained below:
  *   @param {object}           concepts[].concept
  *     @param {string}           concepts[].concept.id        The concept id (required)
  *     @param {boolean}          concepts[].concept.value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @param {object}           metadata                      Object with key values to attach to the input (optional)
  * @return {Promise(Input, error)} A Promise that is fulfilled with an instance of Input or rejected with an error
  */
  mergeConcepts(concepts, metadata) {
    return this._update('merge', concepts, metadata);
  }
  /**
  * Delete concept from an input
  * @param {object[]}         concepts    Object with keys explained below:
  *   @param {object}           concepts[].concept
  *     @param {string}           concepts[].concept.id        The concept id (required)
  *     @param {boolean}          concepts[].concept.value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @param {object}           metadata                      Object with key values to attach to the input (optional)
  * @return {Promise(Input, error)} A Promise that is fulfilled with an instance of Input or rejected with an error
  */
  deleteConcepts(concepts, metadata) {
    return this._update('remove', concepts, metadata);
  }
  /**
  * Overwrite inputs
  * @param {object[]}         concepts                      Array of object with keys explained below:
  *   @param {object}           concepts[].concept
  *     @param {string}           concepts[].concept.id         The concept id (required)
  *     @param {boolean}          concepts[].concept.value      Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @param {object}           metadata                      Object with key values to attach to the input (optional)
  * @return {Promise(Input, error)} A Promise that is fulfilled with an instance of Input or rejected with an error
  */
  overwriteConcepts(concepts, metadata) {
    return this._update('overwrite', concepts, metadata);
  }
  _update(action, concepts=[], metadata=null) {
    let url = `${this._config.apiEndpoint}${INPUTS_PATH}`;
    let inputData = {};
    if (concepts.length) {
      inputData.concepts = concepts;
    }
    if (metadata !== null) {
      inputData.metadata = metadata;
    }
    let data = {
      action,
      inputs: [
        {
          id: this.id,
          data: inputData
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
