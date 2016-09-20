let axios = require('axios');
let Concepts = require('./Concepts');
let {isSuccess} = require('./helpers');
let {API, replaceVars} = require('./constants');
let {wrapToken, formatImagePredict} = require('./utils');
let {
  MODEL_VERSIONS_PATH,
  MODEL_VERSION_PATH,
  MODEL_PATCH_PATH,
  PREDICT_PATH,
  VERSION_PREDICT_PATH,
  MODEL_INPUTS_PATH,
  MODEL_VERSION_INPUTS_PATH
} = API;

/**
* class representing a model
* @class
*/
class Model {
  constructor(_config, data) {
    this._config = _config;
    this.data = data;
    this.name = data.name;
    this.id = data.id;
    this.createdAt = data.created_at;
    this.appId = data.app_id;
    this.outputInfo = data.output_info;
    this.modelVersion = data.model_version;
    this.versionId = (this.modelVersion || {}).id;
    this._rawData = data;
  }
  /**
  * Returns a javascript object with the raw data attributes (from API)
  * @return {object} An object that contains data about model from api
  */
  toObject() {
    return this._rawData;
  }
  /**
  * Add tags from a model
  * @param {object[]}      concepts    List of concept objects with id
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  addConcept(concepts=[]) {
    return this._update('merge_concepts', concepts);
  }
  /**
  * Remove tags from a model
  * @param {object[]}      concepts    List of concept objects with id
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  deleteConcept(concepts=[]) {
    return this._update('delete_concepts', concepts);
  }
  _update(action, conceptsData) {
    let url = `${this._config.apiEndpoint}${replaceVars(MODEL_PATCH_PATH, [this.id])}`;
    let concepts = conceptsData instanceof Concepts?
      conceptsData.toObject('id'):
      conceptsData;
    let params = {
      'concepts': concepts,
      'action': action
    };
    return wrapToken(this._config, (headers)=> {
      data = headers;
      data.params = params;
      return axios.patch(url, data);
    });
  }
  /**
  * Create a new model version
  * @return {Promise(model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
  */
  train() {
    let url = `${this._config.apiEndpoint}${replaceVars(MODEL_VERSIONS_PATH, [this.id])}`;
    return wrapToken(this._config, (headers)=> {
      return new Promise((resolve, reject)=> {
        axios.post(url, null, {headers}).then((response)=> {
          if (isSuccess(response)) {
            resolve(new Model(this._config, response.data.model));
          } else {
            reject(response);
          }
        }, reject);
      });
    });
  }
  /**
  * Returns model ouputs according to inputs
  * @param {object[]|object|string}       inputs    An array of objects/object/string pointing to an image resource. A string can either be a url or base64 image bytes. Object keys explained below:
  *    @param {object}                      inputs[].image     Object with keys explained below:
  *       @param {string}                     inputs[].image.(url|base64)  Can be a publicly accessibly url or base64 string representing image bytes (required)
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  predict(inputs) {
    if (/(Object|String)/.test(Object.prototype.toString.call(inputs))) {
      inputs = [inputs];
    }
    let url = `${this._config.apiEndpoint}${this.versionId?
      replaceVars(VERSION_PREDICT_PATH, [this.id, this.versionId]):
      replaceVars(PREDICT_PATH, [this.id])}`;
    return wrapToken(this._config, (headers)=> {
      let params = {
        'inputs': inputs.map(formatImagePredict)
      };
      return axios.post(url, params, {headers});
    });
  }
  /**
  * Returns a version of the model specified by its id
  * @param {string}     versionId   The model's id
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  getVersion(versionId) {
    let url = `${this._config.apiEndpoint}${replaceVars(MODEL_VERSION_PATH, [this.id, versionId])}`;
    return wrapToken(this._config, (headers)=> {
      return axios.get(url, headers);
    });
  }
  /**
  * Returns a list of versions of the model
  * @param {object}     options     Object with keys explained below: (optional)
  *   @param {number}     options.page        The page number (optional, default: 1)
  *   @param {number}     options.perPage     Number of images to return per page (optional, default: 20)
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  getVersions(options) {
    let url = `${this._config.apiEndpoint}${replaceVars(MODEL_VERSIONS_PATH, [this.id])}`;
    return wrapToken(this._config, (headers)=> {
      let data = headers;
      data.params = options;
      return axios.get(url, data);
    });
  }
  /**
  * Returns all the model's output info
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  getOutputInfo() {
    let url = `${this._config.apiEndpoint}${replaceVars(MODEL_OUTPUT_PATH, [this.id])}`;
    return wrapToken(this._config, (headers)=> {
      return axios.get(url, headers);
    });
  }
  getInputs(options) {
    let url = `${this._config.apiEndpoint}${roptions.versionId?
      replaceVars(MODEL_VERSION_INPUTS_PATH, [this.id, options.versionId]):
      replaceVars(MODEL_INPUTS_PATH, [this.id])}`;
    return wrapToken(this._config, (headers)=> {
      return axios.get(url, headers);
    });
  }
};

module.exports = Model;
