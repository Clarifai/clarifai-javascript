'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');

var _require = require('./helpers'),
    isSuccess = _require.isSuccess,
    checkType = _require.checkType,
    clone = _require.clone;

var _require2 = require('./constants'),
    API = _require2.API,
    SYNC_TIMEOUT = _require2.SYNC_TIMEOUT,
    replaceVars = _require2.replaceVars,
    STATUS = _require2.STATUS,
    POLLTIME = _require2.POLLTIME;

var MODEL_QUEUED_FOR_TRAINING = STATUS.MODEL_QUEUED_FOR_TRAINING,
    MODEL_TRAINING = STATUS.MODEL_TRAINING;

var _require3 = require('./utils'),
    wrapToken = _require3.wrapToken,
    formatImagePredict = _require3.formatImagePredict,
    formatModel = _require3.formatModel;

var MODEL_VERSIONS_PATH = API.MODEL_VERSIONS_PATH,
    MODEL_VERSION_PATH = API.MODEL_VERSION_PATH,
    MODELS_PATH = API.MODELS_PATH,
    PREDICT_PATH = API.PREDICT_PATH,
    VERSION_PREDICT_PATH = API.VERSION_PREDICT_PATH,
    MODEL_INPUTS_PATH = API.MODEL_INPUTS_PATH,
    MODEL_OUTPUT_PATH = API.MODEL_OUTPUT_PATH,
    MODEL_VERSION_INPUTS_PATH = API.MODEL_VERSION_INPUTS_PATH;

/**
* class representing a model
* @class
*/

var Model = function () {
  function Model(_config, data) {
    _classCallCheck(this, Model);

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


  _createClass(Model, [{
    key: 'mergeConcepts',
    value: function mergeConcepts() {
      var concepts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      return this.update({ action: 'merge', concepts: concepts });
    }
    /**
    * Remove concepts from a model
    * @param {object[]}      concepts    List of concept objects with id
    * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
    */

  }, {
    key: 'deleteConcepts',
    value: function deleteConcepts() {
      var concepts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      return this.update({ action: 'remove', concepts: concepts });
    }
    /**
    * Overwrite concepts in a model
    * @param {object[]}      concepts    List of concept objects with id
    * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
    */

  }, {
    key: 'overwriteConcepts',
    value: function overwriteConcepts() {
      var concepts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      return this.update({ action: 'overwrite', concepts: concepts });
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

  }, {
    key: 'update',
    value: function update(obj) {
      var _this = this;

      var url = '' + this._config.apiEndpoint + MODELS_PATH;
      var modelData = [obj];
      var data = { models: modelData.map(formatModel) };
      if (data.concepts) {
        data['action'] = obj.action || 'merge';
      }

      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.patch(url, data, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              resolve(new Model(_this._config, response.data.models[0]));
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

  }, {
    key: 'train',
    value: function train(sync) {
      var _this2 = this;

      var url = '' + this._config.apiEndpoint + replaceVars(MODEL_VERSIONS_PATH, [this.id]);
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.post(url, null, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              if (sync) {
                var timeStart = Date.now();
                _this2._pollTrain.bind(_this2)(timeStart, resolve, reject);
              } else {
                resolve(new Model(_this2._config, response.data.model));
              }
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
  }, {
    key: '_pollTrain',
    value: function _pollTrain(timeStart, resolve, reject) {
      var _this3 = this;

      clearTimeout(this.pollTimeout);
      if (Date.now() - timeStart >= SYNC_TIMEOUT) {
        return reject({
          status: 'Error',
          message: 'Sync call timed out'
        });
      }
      this.getOutputInfo().then(function (model) {
        var modelStatusCode = model.modelVersion.status.code.toString();
        if (modelStatusCode === MODEL_QUEUED_FOR_TRAINING || modelStatusCode === MODEL_TRAINING) {
          _this3.pollTimeout = setTimeout(function () {
            return _this3._pollTrain(timeStart, resolve, reject);
          }, POLLTIME);
        } else {
          resolve(model);
        }
      }, reject).catch(reject);
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

  }, {
    key: 'predict',
    value: function predict(inputs, language) {
      if (checkType(/(Object|String)/, inputs)) {
        inputs = [inputs];
      }
      var url = '' + this._config.apiEndpoint + (this.versionId ? replaceVars(VERSION_PREDICT_PATH, [this.id, this.versionId]) : replaceVars(PREDICT_PATH, [this.id]));
      return wrapToken(this._config, function (headers) {
        var params = { inputs: inputs.map(formatImagePredict) };
        if (language) {
          params['model'] = {
            output_info: {
              output_config: {
                language: language
              }
            }
          };
        }
        return new Promise(function (resolve, reject) {
          axios.post(url, params, { headers: headers }).then(function (response) {
            var data = clone(response.data);
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

  }, {
    key: 'getVersion',
    value: function getVersion(versionId) {
      var url = '' + this._config.apiEndpoint + replaceVars(MODEL_VERSION_PATH, [this.id, versionId]);
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.get(url, { headers: headers }).then(function (response) {
            var data = clone(response.data);
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

  }, {
    key: 'getVersions',
    value: function getVersions() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { page: 1, perPage: 20 };

      var url = '' + this._config.apiEndpoint + replaceVars(MODEL_VERSIONS_PATH, [this.id]);
      return wrapToken(this._config, function (headers) {
        var data = {
          headers: headers,
          params: { 'per_page': options.perPage, 'page': options.page }
        };
        return new Promise(function (resolve, reject) {
          axios.get(url, data).then(function (response) {
            var data = clone(response.data);
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

  }, {
    key: 'getOutputInfo',
    value: function getOutputInfo() {
      var _this4 = this;

      var url = '' + this._config.apiEndpoint + replaceVars(MODEL_OUTPUT_PATH, [this.id]);
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.get(url, { headers: headers }).then(function (response) {
            resolve(new Model(_this4._config, response.data.model));
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

  }, {
    key: 'getInputs',
    value: function getInputs() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { page: 1, perPage: 20 };

      var url = '' + this._config.apiEndpoint + (this.versionId ? replaceVars(MODEL_VERSION_INPUTS_PATH, [this.id, this.versionId]) : replaceVars(MODEL_INPUTS_PATH, [this.id]));
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.get(url, {
            params: { 'per_page': options.perPage, 'page': options.page },
            headers: headers
          }).then(function (response) {
            var data = clone(response.data);
            data.rawData = clone(response.data);
            resolve(data);
          }, reject);
        });
      });
    }
  }]);

  return Model;
}();

;

module.exports = Model;