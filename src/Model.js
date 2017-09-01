let axios = require('axios');
let ModelVersion = require('./ModelVersion');
let {isSuccess, checkType, clone} = require('./helpers');
let {
  API,
  SYNC_TIMEOUT,
  replaceVars,
  STATUS,
  POLLTIME
} = require('./constants');
let {MODEL_QUEUED_FOR_TRAINING, MODEL_TRAINING} = STATUS;
let {wrapToken, formatMediaPredict, formatModel, formatObjectForSnakeCase} = require('./utils');
let {
  MODEL_VERSIONS_PATH,
  MODEL_VERSION_PATH,
  MODELS_PATH,
  MODEL_FEEDBACK_PATH,
  MODEL_VERSION_FEEDBACK_PATH,
  PREDICT_PATH,
  VERSION_PREDICT_PATH,
  MODEL_INPUTS_PATH,
  MODEL_OUTPUT_PATH,
  MODEL_VERSION_INPUTS_PATH,
  MODEL_VERSION_METRICS_PATH
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
      if (data.model_version || data.modelVersion || data.version) {
        this.modelVersion = new ModelVersion(this._config, data.model_version || data.modelVersion || data.version);
      }
      this.versionId = (this.modelVersion || {}).id;
    }
    this.rawData = data;
  }

  /**
   * Merge concepts to a model
   * @param {object[]}      concepts    List of concept objects with id
   * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
   */
  mergeConcepts(concepts = []) {
    let conceptsArr = Array.isArray(concepts) ? concepts : [concepts];
    return this.update({action: 'merge', concepts: conceptsArr});
  }

  /**
   * Remove concepts from a model
   * @param {object[]}      concepts    List of concept objects with id
   * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
   */
  deleteConcepts(concepts = []) {
    let conceptsArr = Array.isArray(concepts) ? concepts : [concepts];
    return this.update({action: 'remove', concepts: conceptsArr});
  }

  /**
   * Overwrite concepts in a model
   * @param {object[]}      concepts    List of concept objects with id
   * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
   */
  overwriteConcepts(concepts = []) {
    let conceptsArr = Array.isArray(concepts) ? concepts : [concepts];
    return this.update({action: 'overwrite', concepts: conceptsArr});
  }

  /**
   * Start a model evaluation job
   * @return {Promise(ModelVersion, error)} A Promise that is fulfilled with a ModelVersion instance or rejected with an error
   */
  runModelEval() {
    let url = `${this._config.basePath}${replaceVars(MODEL_VERSION_METRICS_PATH, [this.id, this.versionId])}`;
    return wrapToken(this._config, (headers) => {
      return new Promise((resolve, reject) => {
        axios.post(url, {}, {headers}).then((response) => {
          if (isSuccess(response)) {
            resolve(new ModelVersion(this._config, response.data.model_version));
          } else {
            reject(response);
          }
        }, reject);
      });
    });
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
    let url = `${this._config.basePath}${MODELS_PATH}`;
    let modelData = [obj];
    let data = {models: modelData.map(m => formatModel(Object.assign(m, {id: this.id})))};
    if (Array.isArray(obj.concepts)) {
      data['action'] = obj.action || 'merge';
    }

    return wrapToken(this._config, (headers) => {
      return new Promise((resolve, reject) => {
        axios.patch(url, data, {headers}).then((response) => {
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
    let url = `${this._config.basePath}${replaceVars(MODEL_VERSIONS_PATH, [this.id])}`;
    return wrapToken(this._config, (headers) => {
      return new Promise((resolve, reject) => {
        axios.post(url, null, {headers}).then((response) => {
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
    this.getOutputInfo().then((model) => {
      let modelStatusCode = model.modelVersion.status.code.toString();
      if (modelStatusCode === MODEL_QUEUED_FOR_TRAINING || modelStatusCode === MODEL_TRAINING) {
        this.pollTimeout = setTimeout(() => this._pollTrain(timeStart, resolve, reject), POLLTIME);
      } else {
        resolve(model);
      }
    }, reject)
      .catch(reject);
  }

  /**
   * Returns model ouputs according to inputs
   * @param {object[]|object|string}       inputs    An array of objects/object/string pointing to an image resource. A string can either be a url or base64 image bytes. Object keys explained below:
   *    @param {object}                      inputs[].image     Object with keys explained below:
   *       @param {string}                     inputs[].image.(url|base64)   Can be a publicly accessibly url or base64 string representing image bytes (required)
   *       @param {number[]}                   inputs[].image.crop           An array containing the percent to be cropped from top, left, bottom and right (optional)
   * @param {object|string} config An object with keys explained below. If a string is passed instead, it will be treated as the language (backwards compatibility)
   *   @param {string} config.language A string code representing the language to return results in (example: 'zh' for simplified Chinese, 'ru' for Russian, 'ja' for Japanese)
   *   @param {boolean} config.video indicates if the input should be processed as a video
   *   @param {object[]} config.selectConcepts An array of concepts to return. Each object in the array will have a form of {name: <CONCEPT_NAME>} or {id: CONCEPT_ID}
   *   @param {float} config.minValue The minimum confidence threshold that a result must meet. From 0.0 to 1.0
   *   @param {number} config.maxConcepts The maximum number of concepts to return
   * @param {boolean} isVideo  Deprecated: indicates if the input should be processed as a video (default false). Deprecated in favor of using config object
   * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
   */
  predict(inputs, config = {}, isVideo = false) {
    if (checkType(/String/, config)) {
      console.warn('passing the language as a string is deprecated, consider using the configuration object instead');
      config = {
        language: config
      };
    }

    if (isVideo) {
      console.warn('"isVideo" argument is deprecated, consider using the configuration object instead');
      config.video = isVideo;
    }
    const video = config.video || false;
    delete config.video;
    if (checkType(/(Object|String)/, inputs)) {
      inputs = [inputs];
    }
    let url = `${this._config.basePath}${this.versionId ?
      replaceVars(VERSION_PREDICT_PATH, [this.id, this.versionId]) :
      replaceVars(PREDICT_PATH, [this.id])}`;
    return wrapToken(this._config, (headers) => {
      let params = {inputs: inputs.map(input => formatMediaPredict(input, video ? 'video' : 'image'))};
      if (config && Object.getOwnPropertyNames(config).length > 0) {
        params['model'] = {
          output_info: {
            output_config: formatObjectForSnakeCase(config)
          }
        };
      }
      return new Promise((resolve, reject) => {
        axios.post(url, params, {headers}).then((response) => {
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
    let url = `${this._config.basePath}${replaceVars(MODEL_VERSION_PATH, [this.id, versionId])}`;
    return wrapToken(this._config, (headers) => {
      return new Promise((resolve, reject) => {
        axios.get(url, {headers}).then((response) => {
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
  getVersions(options = {page: 1, perPage: 20}) {
    let url = `${this._config.basePath}${replaceVars(MODEL_VERSIONS_PATH, [this.id])}`;
    return wrapToken(this._config, (headers) => {
      let data = {
        headers,
        params: {'per_page': options.perPage, 'page': options.page},
      };
      return new Promise((resolve, reject) => {
        axios.get(url, data).then((response) => {
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
    let url = `${this._config.basePath}${replaceVars(MODEL_OUTPUT_PATH, [this.id])}`;
    return wrapToken(this._config, (headers) => {
      return new Promise((resolve, reject) => {
        axios.get(url, {headers}).then((response) => {
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
  getInputs(options = {page: 1, perPage: 20}) {
    let url = `${this._config.basePath}${this.versionId ?
      replaceVars(MODEL_VERSION_INPUTS_PATH, [this.id, this.versionId]) :
      replaceVars(MODEL_INPUTS_PATH, [this.id])}`;
    return wrapToken(this._config, (headers) => {
      return new Promise((resolve, reject) => {
        axios.get(url, {
          params: {'per_page': options.perPage, 'page': options.page},
          headers
        }).then((response) => {
          let data = clone(response.data);
          data.rawData = clone(response.data);
          resolve(data);
        }, reject);
      });
    });
  }

  /**
   *
   * @param {string} input A string pointing to an image resource. A string must be a url
   * @param {object} config A configuration object consisting of the following required keys
   *   @param {string} config.id The id of the feedback request
   *   @param {object} config.data The feedback data to be sent
   *   @param {object} config.info Meta data related to the feedback request
   * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
   */
  feedback(input, {id, data, info}) {
    const url = `${this._config.basePath}${this.versionId ?
      replaceVars(MODEL_VERSION_FEEDBACK_PATH, [this.id, this.versionId]) :
      replaceVars(MODEL_FEEDBACK_PATH, [this.id])}`;
    const media = formatMediaPredict(input).data;
    info.eventType = 'annotation';
    const body = {
      input: {
        id,
        data: Object.assign(media, data),
        'feedback_info': formatObjectForSnakeCase(info)
      }
    };
    return wrapToken(this._config, headers => {
      return new Promise((resolve, reject) => {
        axios.post(url, body, {
          headers
        }).then(({data}) => {
          const d = clone(data);
          d.rawData = clone(data);
          resolve(d);
        }, reject);
      });
    });
  }
}

module
  .exports = Model;
