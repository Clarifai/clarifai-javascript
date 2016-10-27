let axios = require('axios');
let Concepts = require('./Concepts');
let {isSuccess, checkType} = require('./helpers');
let {API, replaceVars} = require('./constants');
let {wrapToken, formatImagePredict} = require('./utils');
let {
  MODEL_VERSIONS_PATH,
  MODEL_VERSION_PATH,
  MODEL_PATCH_PATH,
  PREDICT_PATH,
  VERSION_PREDICT_PATH,
  MODEL_INPUTS_PATH,
  MODEL_OUTPUT_PATH,
  MODEL_VERSION_INPUTS_PATH
} = API;
const MODEL_QUEUED_FOR_TRAINING = '21103';
const MODEL_TRAINING = '21101';
const POLLTIME = 2000;

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
    this.createdAt = data.created_at || data.createdAt;
    this.appId = data.app_id || data.appId;
    this.outputInfo = data.output_info || data.outputInfo;
    if (checkType(/(String)/, data.version)) {
      this.modelVersion = {};
      this.versionId = data.version;
    } else {
      this.modelVersion = data.model_version || data.modelVersion || data.version;
      this.versionId = (this.modelVersion || {}).id;
    }
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
  * Merge concepts from a model
  * @param {object[]}      concepts    List of concept objects with id
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  mergeConcepts(concepts=[]) {
    return this._update('merge_concepts', concepts);
  }
  /**
  * Remove concepts from a model
  * @param {object[]}      concepts    List of concept objects with id
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  deleteConcepts(concepts=[]) {
    return this._update('delete_concepts', concepts);
  }
  _update(action, conceptsData) {
    if (!Array.isArray(conceptsData)) {
      conceptsData = [conceptsData];
    }
    let url = `${this._config.apiEndpoint}${replaceVars(MODEL_PATCH_PATH, [this.id])}`;
    let concepts = conceptsData[0] instanceof Concepts?
      conceptsData.toObject('id'):
      conceptsData;
    let data = {
      'concepts': concepts,
      'action': action
    };
    return wrapToken(this._config, (headers)=> {
      return axios.patch(url, data, {headers});
    });
  }
  /**
  * Create a new model version
  * @param {boolean}       sync     If true, this returns after model has completely trained. If false, this immediately returns default api response.
  * @return {Promise(model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
  */
  train(sync) {
    let url = `${this._config.apiEndpoint}${replaceVars(MODEL_VERSIONS_PATH, [this.id])}`;
    return wrapToken(this._config, (headers)=> {
      return new Promise((resolve, reject)=> {
        axios.post(url, null, {headers}).then((response)=> {
          if (isSuccess(response)) {
            if (sync) {
              this._pollTrain.bind(this)(resolve, reject);
            } else {
              resolve(new Model(this._config, response.data.model));
            }
          } else {
            reject(response);
          }
        }, reject);
      });
    });
  }
  _pollTrain(resolve, reject) {
    clearTimeout(this.pollTimeout);
    this.getOutputInfo().then((model)=> {
      let modelStatusCode = model.modelVersion.status.code.toString();
      if (modelStatusCode === MODEL_QUEUED_FOR_TRAINING || modelStatusCode === MODEL_TRAINING) {
        this.pollTimeout = setTimeout(()=> this._pollTrain(resolve, reject), POLLTIME);
      } else {
        resolve(model);
      }
    },
    reject)
    .catch(reject);
  }
  /**
  * Returns model ouputs according to inputs
  * @param {object[]|object|string}       inputs    An array of objects/object/string pointing to an image resource. A string can either be a url or base64 image bytes. Object keys explained below:
  *    @param {object}                      inputs[].image     Object with keys explained below:
  *       @param {string}                     inputs[].image.(url|base64)  Can be a publicly accessibly url or base64 string representing image bytes (required)
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  predict(inputs) {
    if (checkType(/(Object|String)/, inputs)) {
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
      return new Promise((resolve, reject)=> {
        axios.get(url, {headers}).then((response)=> {
          resolve(response.data);
        }, reject);
      });
    });
  }
  /**
  * Returns a list of versions of the model
  * @param {object}     options     Object with keys explained below: (optional)
  *   @param {number}     options.page        The page number (optional, default: 1)
  *   @param {number}     options.perPage     Number of images to return per page (optional, default: 20)
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  getVersions(options={page: 1, perPage: 20}) {
    let url = `${this._config.apiEndpoint}${replaceVars(MODEL_VERSIONS_PATH, [this.id])}`;
    return wrapToken(this._config, (headers)=> {
      let data = {
        headers,
        params: {'per_page': options.perPage, 'page': options.page},
      };
      return axios.get(url, data);
    });
  }
  /**
  * Returns all the model's output info
  * @return {Promise(Model, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  getOutputInfo() {
    let url = `${this._config.apiEndpoint}${replaceVars(MODEL_OUTPUT_PATH, [this.id])}`;
    return wrapToken(this._config, (headers)=> {
      return new Promise((resolve, reject)=> {
        axios.get(url, {headers}).then((response)=> {
          resolve(new Model(this._config, response.data.model));
        }, reject);
      });
    });
  }
  /**
  * Returns all the model's inputs
  * @param {object}     options     Object with keys explained below: (optional)
  *   @param {number}     options.page        The page number (optional, default: 1)
  *   @param {number}     options.perPage     Number of images to return per page (optional, default: 20)
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  getInputs(options={page: 1, perPage: 20}) {
    let url = `${this._config.apiEndpoint}${this.versionId?
      replaceVars(MODEL_VERSION_INPUTS_PATH, [this.id, this.versionId]):
      replaceVars(MODEL_INPUTS_PATH, [this.id])}`;
    return wrapToken(this._config, (headers)=> {
      return axios.get(url, {
        params: {'per_page': options.perPage, 'page': options.page},
        headers
      });
    });
  }
};

module.exports = Model;
