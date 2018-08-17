let axios = require('axios');
let Promise = require('promise');
let Model = require('./Model');
let Concepts = require('./Concepts');
let {API, ERRORS, replaceVars} = require('./constants');
let {isSuccess, checkType, clone} = require('./helpers');
let {wrapToken, formatModel} = require('./utils');
let {MODELS_PATH, MODEL_PATH, MODEL_SEARCH_PATH, MODEL_VERSION_PATH} = API;

/**
 * class representing a collection of models
 * @class
 */
class Models {
  constructor(_config, rawData = []) {
    this._config = _config;
    this.rawData = rawData;
    rawData.forEach((modelData, index) => {
      this[index] = new Model(this._config, modelData);
    });
    this.length = rawData.length;
  }

  /**
   * Returns a Model instance given model id or name. It will call search if name is given.
   * @param {string|object}    model       If string, it is assumed to be model id. Otherwise, if object is given, it can have any of the following keys:
   *   @param {string}           model.id          Model id
   *   @param {string}           model.name        Model name
   *   @param {string}           model.version     Model version
   *   @param {string}           model.type        This can be "concept", "color", "embed", "facedetect", "cluster" or "blur"
   * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
   */
  initModel(model) {
    let data = {};
    let fn;
    if (checkType(/String/, model)) {
      data.id = model;
    } else {
      data = model;
    }
    if (data.id) {
      fn = (resolve, reject) => {
        resolve(new Model(this._config, data));
      };
    } else {
      fn = (resolve, reject) => {
        this.search(data.name, data.type).then((models) => {
          if (data.version) {
            resolve(models.rawData.filter((model) => model.modelVersion.id === data.version));
          } else {
            resolve(models[0]);
          }
        }, reject).catch(reject);
      };
    }
    return new Promise(fn);
  }

  /**
   * Calls predict given model info and inputs to predict on
   * @param {string|object}            model       If string, it is assumed to be model id. Otherwise, if object is given, it can have any of the following keys:
   *   @param {string}                   model.id          Model id
   *   @param {string}                   model.name        Model name
   *   @param {string}                   model.version     Model version
   *   @param {string}                   model.language    Model language (only for Clarifai's public models)
   *   @param {string}                   model.type        This can be "concept", "color", "embed", "facedetect", "cluster" or "blur"
   * @param {object[]|object|string}   inputs    An array of objects/object/string pointing to an image resource. A string can either be a url or base64 image bytes. Object keys explained below:
   *    @param {object}                  inputs[].image     Object with keys explained below:
   *       @param {string}                 inputs[].image.(url|base64)  Can be a publicly accessibly url or base64 string representing image bytes (required)
   * @param {boolean} isVideo  indicates if the input should be processed as a video (default false)
   * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
   */
  predict(model, inputs, config = {}) {
    if (checkType(/Boolean/, config)) {
      console.warn('"isVideo" argument is deprecated, consider using the configuration object instead');
      config = {
        video: config
      };
    }
    if (model.language) {
      config.language = model.language;
    }
    return new Promise((resolve, reject) => {
      this.initModel(model).then((modelObj) => {
        modelObj.predict(inputs, config)
          .then(resolve, reject)
          .catch(reject);
      }, reject);
    });
  }

  /**
   * Calls train on a model and creates a new model version given model info
   * @param {string|object}            model       If string, it is assumed to be model id. Otherwise, if object is given, it can have any of the following keys:
   *   @param {string}                   model.id          Model id
   *   @param {string}                   model.name        Model name
   *   @param {string}                   model.version     Model version
   *   @param {string}                   model.type        This can be "concept", "color", "embed", "facedetect", "cluster" or "blur"
   * @param {boolean}                  sync        If true, this returns after model has completely trained. If false, this immediately returns default api response.
   * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
   */
  train(model, sync = false) {
    return new Promise((resolve, reject) => {
      this.initModel(model).then((model) => {
        model.train(sync)
          .then(resolve, reject)
          .catch(reject);
      }, reject);
    });
  }

  /**
   *
   * @param {string|object}            model       If string, it is assumed to be model id. Otherwise, if object is given, it can have any of the following keys:
   *   @param {string}                   model.id          Model id
   *   @param {string}                   model.name        Model name
   *   @param {string}                   model.version     Model version
   *   @param {string}                   model.type        This can be "concept", "color", "embed", "facedetect", "cluster" or "blur"
   * @param {string} input A string pointing to an image resource. A string must be a url
   * @param {object} config A configuration object consisting of the following required keys
   *   @param {string} config.id The id of the feedback request
   *   @param {object} config.data The feedback data to be sent
   *   @param {object} config.info Meta data related to the feedback request
   */
  feedback(model, input, config) {
    return new Promise((resolve, reject) => {
      this.initModel(model)
        .then(model => {
          return model.feedback(input, config);
        })
        .then(d => resolve(d))
        .catch(e => reject(e));
    });
  }

  /**
   * Returns a version of the model specified by its id
   * @param {string|object}            model       If string, it is assumed to be model id. Otherwise, if object is given, it can have any of the following keys:
   *   @param {string}                   model.id          Model id
   *   @param {string}                   model.name        Model name
   *   @param {string}                   model.version     Model version
   *   @param {string}                   model.type        This can be "concept", "color", "embed", "facedetect", "cluster" or "blur"
   * @param {string}     versionId   The model's id
   * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
   */
  getVersion(model, versionId) {
    return new Promise((resolve, reject) => {
      this.initModel(model).then((model) => {
        model.getVersion(versionId)
          .then(resolve, reject)
          .catch(reject);
      }, reject);
    });
  }

  /**
   * Returns a list of versions of the model
   * @param {string|object}            model       If string, it is assumed to be model id. Otherwise, if object is given, it can have any of the following keys:
   *   @param {string}                   model.id          Model id
   *   @param {string}                   model.name        Model name
   *   @param {string}                   model.version     Model version
   *   @param {string}                   model.type        This can be "concept", "color", "embed", "facedetect", "cluster" or "blur"
   * @param {object}                   options     Object with keys explained below: (optional)
   *   @param {number}                   options.page        The page number (optional, default: 1)
   *   @param {number}                   options.perPage     Number of images to return per page (optional, default: 20)
   * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
   */
  getVersions(model, options = {page: 1, perPage: 20}) {
    return new Promise((resolve, reject) => {
      this.initModel(model).then((model) => {
        model.getVersions(options)
          .then(resolve, reject)
          .catch(reject);
      }, reject);
    });
  }

  /**
   * Returns all the model's output info
   * @param {string|object}            model       If string, it is assumed to be model id. Otherwise, if object is given, it can have any of the following keys:
   *   @param {string}                   model.id          Model id
   *   @param {string}                   model.name        Model name
   *   @param {string}                   model.version     Model version
   *   @param {string}                   model.type        This can be "concept", "color", "embed", "facedetect", "cluster" or "blur"
   * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
   */
  getOutputInfo(model) {
    return new Promise((resolve, reject) => {
      this.initModel(model).then((model) => {
        model.getOutputInfo()
          .then(resolve, reject)
          .catch(reject);
      }, reject);
    });
  }

  /**
   * Returns all the models
   * @param {Object}     options     Object with keys explained below: (optional)
   *   @param {Number}     options.page        The page number (optional, default: 1)
   *   @param {Number}     options.perPage     Number of images to return per page (optional, default: 20)
   * @return {Promise(Models, error)} A Promise that is fulfilled with an instance of Models or rejected with an error
   */
  list(options = {page: 1, perPage: 20}) {
    let url = `${this._config.basePath}${MODELS_PATH}`;
    return wrapToken(this._config, (headers) => {
      return new Promise((resolve, reject) => {
        axios.get(url, {
          params: {'per_page': options.perPage, 'page': options.page},
          headers
        }).then((response) => {
          if (isSuccess(response)) {
            resolve(new Models(this._config, response.data.models));
          } else {
            reject(response);
          }
        }, reject);
      });
    });
  }

  /**
   * Create a model
   * @param {string|object}                  model                                  If string, it is assumed to be the model id. Otherwise, if object is given, it can have any of the following keys:
   *   @param {string}                         model.id                               Model id
   *   @param {string}                         model.name                             Model name
   * @param {object[]|string[]|Concepts[]}   conceptsData                           List of objects with ids, concept id strings or an instance of Concepts object
   * @param {Object}                         options                                Object with keys explained below:
   *   @param {boolean}                        options.conceptsMutuallyExclusive      Do you expect to see more than one of the concepts in this model in the SAME image? Set to false (default) if so. Otherwise, set to true.
   *   @param {boolean}                        options.closedEnvironment              Do you expect to run the trained model on images that do not contain ANY of the concepts in the model? Set to false (default) if so. Otherwise, set to true.
   * @return {Promise(Model, error)} A Promise that is fulfilled with an instance of Model or rejected with an error
   */
  create(model, conceptsData = [], options = {}) {
    let concepts = conceptsData instanceof Concepts ?
      conceptsData.toObject('id') :
      conceptsData.map((concept) => {
        let val = concept;
        if (checkType(/String/, concept)) {
          val = {'id': concept};
        }
        return val;
      });
    let modelObj = model;
    if (checkType(/String/, model)) {
      modelObj = {id: model, name: model};
    }
    if (modelObj.id === undefined) {
      throw ERRORS.paramsRequired('Model ID');
    }
    let url = `${this._config.basePath}${MODELS_PATH}`;
    let data = {model: modelObj};
    data['model']['output_info'] = {
      'data': {
        concepts
      },
      'output_config': {
        'concepts_mutually_exclusive': !!options.conceptsMutuallyExclusive,
        'closed_environment': !!options.closedEnvironment
      }
    };

    return wrapToken(this._config, (headers) => {
      return new Promise((resolve, reject) => {
        axios.post(url, data, {headers}).then((response) => {
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
   * Returns a model specified by ID
   * @param {String}     id          The model's id
   * @return {Promise(Model, error)} A Promise that is fulfilled with an instance of Model or rejected with an error
   */
  get(id) {
    let url = `${this._config.basePath}${replaceVars(MODEL_PATH, [id])}`;
    return wrapToken(this._config, (headers) => {
      return new Promise((resolve, reject) => {
        axios.get(url, {headers}).then((response) => {
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
   * Update a model's or a list of models' output config or concepts
   * @param {object|object[]}      models                                 Can be a single model object or list of model objects with the following attrs:
   *   @param {string}               models.id                                    The id of the model to apply changes to (Required)
   *   @param {string}               models.name                                  The new name of the model to update with
   *   @param {boolean}              models.conceptsMutuallyExclusive             Do you expect to see more than one of the concepts in this model in the SAME image? Set to false (default) if so. Otherwise, set to true.
   *   @param {boolean}              models.closedEnvironment                     Do you expect to run the trained model on images that do not contain ANY of the concepts in the model? Set to false (default) if so. Otherwise, set to true.
   *   @param {object[]}             models.concepts                              An array of concept objects or string
   *     @param {object|string}        models.concepts[].concept                    If string is given, this is interpreted as concept id. Otherwise, if object is given, client expects the following attributes
   *       @param {string}             models.concepts[].concept.id                   The id of the concept to attach to the model
   *   @param {object[]}             models.action                                The action to perform on the given concepts. Possible values are 'merge', 'remove', or 'overwrite'. Default: 'merge'
   * @return {Promise(Models, error)} A Promise that is fulfilled with an instance of Models or rejected with an error
   */
  update(models) {
    let url = `${this._config.basePath}${MODELS_PATH}`;
    let modelsList = Array.isArray(models) ? models : [models];
    let data = {models: modelsList.map(formatModel)};
    data['action'] = models.action || 'merge';
    return wrapToken(this._config, (headers) => {
      return new Promise((resolve, reject) => {
        axios.patch(url, data, {headers}).then((response) => {
          if (isSuccess(response)) {
            resolve(new Models(this._config, response.data.models));
          } else {
            reject(response);
          }
        }, reject);
      });
    });
  }

  /**
   * Update model by merging concepts
   * @param {object|object[]}      model                                 Can be a single model object or list of model objects with the following attrs:
   *   @param {string}               model.id                                    The id of the model to apply changes to (Required)
   *   @param {object[]}             model.concepts                              An array of concept objects or string
   *     @param {object|string}        model.concepts[].concept                    If string is given, this is interpreted as concept id. Otherwise, if object is given, client expects the following attributes
   *       @param {string}             model.concepts[].concept.id                   The id of the concept to attach to the model
   */
  mergeConcepts(model = {}) {
    model.action = 'merge';
    return this.update(model);
  }

  /**
   * Update model by removing concepts
   * @param {object|object[]}      model                                 Can be a single model object or list of model objects with the following attrs:
   *   @param {string}               model.id                                    The id of the model to apply changes to (Required)
   *   @param {object[]}             model.concepts                              An array of concept objects or string
   *     @param {object|string}        model.concepts[].concept                    If string is given, this is interpreted as concept id. Otherwise, if object is given, client expects the following attributes
   *       @param {string}             model.concepts[].concept.id                   The id of the concept to attach to the model
   */
  deleteConcepts(model = {}) {
    model.action = 'remove';
    return this.update(model);
  }

  /**
   * Update model by overwriting concepts
   * @param {object|object[]}      model                                 Can be a single model object or list of model objects with the following attrs:
   *   @param {string}               model.id                                    The id of the model to apply changes to (Required)
   *   @param {object[]}             model.concepts                              An array of concept objects or string
   *     @param {object|string}        model.concepts[].concept                    If string is given, this is interpreted as concept id. Otherwise, if object is given, client expects the following attributes
   *       @param {string}             model.concepts[].concept.id                   The id of the concept to attach to the model
   */
  overwriteConcepts(model = {}) {
    model.action = 'overwrite';
    return this.update(model);
  }

  /**
   * Deletes all models (if no ids and versionId given) or a model (if given id) or a model version (if given id and verion id)
   * @param {String|String[]}      ids         Can be a single string or an array of strings representing the model ids
   * @param {String}               versionId   The model's version id
   * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
   */
  delete(ids, versionId = null) {
    let request, url, data;
    let id = ids;

    if (checkType(/String/, ids) || (checkType(/Array/, ids) && ids.length === 1 )) {
      if (versionId) {
        url = `${this._config.basePath}${replaceVars(MODEL_VERSION_PATH, [id, versionId])}`;
      } else {
        url = `${this._config.basePath}${replaceVars(MODEL_PATH, [id])}`;
      }
      request = wrapToken(this._config, (headers) => {
        return new Promise((resolve, reject) => {
          axios.delete(url, {headers}).then((response) => {
            let data = clone(response.data);
            data.rawData = clone(response.data);
            resolve(data);
          }, reject);
        });
      });
    } else {
      if (!ids && !versionId) {
        url = `${this._config.basePath}${MODELS_PATH}`;
        data = {'delete_all': true};
      } else if (!versionId && ids.length > 1) {
        url = `${this._config.basePath}${MODELS_PATH}`;
        data = {ids};
      } else {
        throw ERRORS.INVALID_DELETE_ARGS;
      }
      request = wrapToken(this._config, (headers) => {
        return new Promise((resolve, reject) => {
          axios({
            method: 'delete',
            url,
            data,
            headers
          }).then((response) => {
            let data = clone(response.data);
            data.rawData = clone(response.data);
            resolve(data);
          }, reject);
        });
      });
    }

    return request;
  }

  /**
   * Search for models by name or type
   * @param {String}     name        The model name
   * @param {String}     type        This can be "concept", "color", "embed", "facedetect", "cluster" or "blur"
   * @return {Promise(models, error)} A Promise that is fulfilled with an instance of Models or rejected with an error
   */
  search(name, type = null) {
    let url = `${this._config.basePath}${MODEL_SEARCH_PATH}`;
    return wrapToken(this._config, (headers) => {
      let params = {
        'model_query': {
          name,
          type
        }
      };
      return new Promise((resolve, reject) => {
        axios.post(url, params, {headers}).then((response) => {
          if (isSuccess(response)) {
            resolve(new Models(this._config, response.data.models));
          } else {
            reject(response);
          }
        }, reject);
      });
    });
  }
}

module.exports = Models;
