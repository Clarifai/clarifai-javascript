let axios = require('axios');
let {isSuccess, checkType, clone} = require('./helpers');
let {
  API,
  SYNC_TIMEOUT,
  replaceVars,
  STATUS,
  POLLTIME
} = require('./constants');
let {MODEL_QUEUED_FOR_TRAINING, MODEL_TRAINING} = STATUS;
let {wrapToken, formatImagePredict, formatModel} = require('./utils');
let {
  MODEL_VERSIONS_PATH,
  MODEL_VERSION_PATH,
  MODELS_PATH,
  PREDICT_PATH,
  VERSION_PREDICT_PATH,
  MODEL_INPUTS_PATH,
  MODEL_OUTPUT_PATH,
  MODEL_VERSION_INPUTS_PATH
} = API;

/**
* class representing a model
* @class
*/
class Model {
  constructor(_config, data) {
    this._config = _config;
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
    this.rawData = data;
  }
  /**
  * Merge concepts to a model
  * @param {object[]}      concepts    List of concept objects with id
  * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
  */
  mergeConcepts(concepts=[]) {
    return this.update({action: 'merge', concepts});
  }
  /**
  * Remove concepts from a model
  * @param {object[]}      concepts    List of concept objects with id
  * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
  */
  deleteConcepts(concepts=[]) {
    return this.update({action: 'remove', concepts});
  }
  /**
  * Overwrite concepts in a model
  * @param {object[]}      concepts    List of concept objects with id
  * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
  */
  overwriteConcepts(concepts=[]) {
    return this.update({action: 'overwrite', concepts});
  }
  /**
  * Update a model's output config or concepts
  * @param {object}               model                                 An object with any of the following attrs:
  *   @param {string}               name                                  The new name of the model to update with
  *   @param {boolean}              conceptsMutuallyExclusive             Do you expect to see more than one of the concepts in this model in the SAME image? Set to false (default) if so. Otherwise, set to true.
  *   @param {boolean}              closedEnvironment                     Do you expect to run the trained model on images that do not contain ANY of the concepts in the model? Set to false (default) if so. Otherwise, set to true.
  *   @param {object[]}             concepts                              An array of concept objects or string
  *     @param {object|string}        concepts[].concept                    If string is given, this is interpreted as concept id. Otherwise, if object is given, client expects the following attributes
  *       @param {string}             concepts[].concept.id                   The id of the concept to attach to the model
  *   @param {object[]}             action                                The action to perform on the given concepts. Possible values are 'merge', 'remove', or 'overwrite'. Default: 'merge'
  * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
  */
  update(obj) {
    let url = `${this._config.apiEndpoint}${MODELS_PATH}`;
    let modelData = [obj];
    let data = {models: modelData.map(formatModel)};
    if (data.concepts) {
      data['action'] = obj.action || 'merge';
    }

    return wrapToken(this._config, (headers)=> {
      return new Promise((resolve, reject)=> {
        axios.patch(url, data, {headers}).then((response)=> {
          if (isSuccess(response)) {
            resolve(new Model(this._config, response.data.models[0]));
          } else {
            reject(response);
          }
        }, reject);
      });
    });
  }
  /**
  * Create a new model version
  * @param {boolean}       sync     If true, this returns after model has completely trained. If false, this immediately returns default api response.
  * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
  */
  train(sync) {
    let url = `${this._config.apiEndpoint}${replaceVars(MODEL_VERSIONS_PATH, [this.id])}`;
    return wrapToken(this._config, (headers)=> {
      return new Promise((resolve, reject)=> {
        axios.post(url, null, {headers}).then((response)=> {
          if (isSuccess(response)) {
            if (sync) {
              let timeStart = Date.now();
              this._pollTrain.bind(this)(timeStart, resolve, reject);
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
  _pollTrain(timeStart, resolve, reject) {
    clearTimeout(this.pollTimeout);
    if ((Date.now() - timeStart) >= SYNC_TIMEOUT) {
      return reject({
        status: 'Error',
        message: 'Sync call timed out'
      });
    }
    this.getOutputInfo().then((model)=> {
      let modelStatusCode = model.modelVersion.status.code.toString();
      if (modelStatusCode === MODEL_QUEUED_FOR_TRAINING || modelStatusCode === MODEL_TRAINING) {
        this.pollTimeout = setTimeout(()=> this._pollTrain(timeStart, resolve, reject), POLLTIME);
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
  *       @param {string}                     inputs[].image.(url|base64)   Can be a publicly accessibly url or base64 string representing image bytes (required)
  *       @param {number[]}                   inputs[].image.crop           An array containing the percent to be cropped from top, left, bottom and right (optional)
  * @param {string}                       language  A string code representing the language to return results in (example: 'zh' for simplified Chinese, 'ru' for Russian, 'ja' for Japanese)
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  predict(inputs, language) {
    if (checkType(/(Object|String)/, inputs)) {
      inputs = [inputs];
    }
    let url = `${this._config.apiEndpoint}${this.versionId?
      replaceVars(VERSION_PREDICT_PATH, [this.id, this.versionId]):
      replaceVars(PREDICT_PATH, [this.id])}`;
    return wrapToken(this._config, (headers)=> {
      let params = { inputs: inputs.map(formatImagePredict) };
      if (language) {
        params['model'] = {
          output_info: {
            output_config: {
              language
            }
          }
        };
      }
      return new Promise((resolve, reject)=> {
        axios.post(url, params, {headers}).then((response)=> {
          let data = clone(response.data);
          data.rawData = clone(response.data);
          resolve(data);
        }, reject);
      });
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
          let data = clone(response.data);
          data.rawData = clone(response.data);
          resolve(data);
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
      return new Promise((resolve, reject)=> {
        axios.get(url, data).then((response)=> {
          let data = clone(response.data);
          data.rawData = clone(response.data);
          resolve(data);
        }, reject);
      });
    });
  }
  /**
  * Returns all the model's output info
  * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
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
      return new Promise((resolve, reject)=> {
        axios.get(url, {
          params: {'per_page': options.perPage, 'page': options.page},
          headers
        }).then((response)=> {
          let data = clone(response.data);
          data.rawData = clone(response.data);
          resolve(data);
        }, reject);
      });
    });
  }
};

module.exports = Model;
