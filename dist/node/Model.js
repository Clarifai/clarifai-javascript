'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');
var Concepts = require('./Concepts');

var _require = require('./helpers');

var isSuccess = _require.isSuccess;
var checkType = _require.checkType;

var _require2 = require('./constants');

var API = _require2.API;
var replaceVars = _require2.replaceVars;

var _require3 = require('./utils');

var wrapToken = _require3.wrapToken;
var formatImagePredict = _require3.formatImagePredict;
var MODEL_VERSIONS_PATH = API.MODEL_VERSIONS_PATH;
var MODEL_VERSION_PATH = API.MODEL_VERSION_PATH;
var MODEL_PATCH_PATH = API.MODEL_PATCH_PATH;
var PREDICT_PATH = API.PREDICT_PATH;
var VERSION_PREDICT_PATH = API.VERSION_PREDICT_PATH;
var MODEL_INPUTS_PATH = API.MODEL_INPUTS_PATH;
var MODEL_OUTPUT_PATH = API.MODEL_OUTPUT_PATH;
var MODEL_VERSION_INPUTS_PATH = API.MODEL_VERSION_INPUTS_PATH;

var MODEL_QUEUED_FOR_TRAINING = '21103';
var MODEL_TRAINING = '21101';
var POLLTIME = 2000;

/**
* class representing a model
* @class
*/

var Model = function () {
  function Model(_config, data) {
    _classCallCheck(this, Model);

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


  _createClass(Model, [{
    key: 'toObject',
    value: function toObject() {
      return this._rawData;
    }
    /**
    * Merge concepts from a model
    * @param {object[]}      concepts    List of concept objects with id
    * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
    */

  }, {
    key: 'mergeConcepts',
    value: function mergeConcepts() {
      var concepts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      return this._update('merge_concepts', concepts);
    }
    /**
    * Remove concepts from a model
    * @param {object[]}      concepts    List of concept objects with id
    * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
    */

  }, {
    key: 'deleteConcepts',
    value: function deleteConcepts() {
      var concepts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      return this._update('delete_concepts', concepts);
    }
  }, {
    key: '_update',
    value: function _update(action, conceptsData) {
      if (!Array.isArray(conceptsData)) {
        conceptsData = [conceptsData];
      }
      var url = '' + this._config.apiEndpoint + replaceVars(MODEL_PATCH_PATH, [this.id]);
      var concepts = conceptsData[0] instanceof Concepts ? conceptsData.toObject('id') : conceptsData;
      var data = {
        'concepts': concepts,
        'action': action
      };
      return wrapToken(this._config, function (headers) {
        return axios.patch(url, data, { headers: headers });
      });
    }
    /**
    * Create a new model version
    * @param {boolean}       sync     If true, this returns after model has completely trained. If false, this immediately returns default api response.
    * @return {Promise(model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
    */

  }, {
    key: 'train',
    value: function train(sync) {
      var _this = this;

      var url = '' + this._config.apiEndpoint + replaceVars(MODEL_VERSIONS_PATH, [this.id]);
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.post(url, null, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              if (sync) {
                _this._pollTrain.bind(_this)(resolve, reject);
              } else {
                resolve(new Model(_this._config, response.data.model));
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
    value: function _pollTrain(resolve, reject) {
      var _this2 = this;

      clearTimeout(this.pollTimeout);
      this.getOutputInfo().then(function (model) {
        var modelStatusCode = model.modelVersion.status.code.toString();
        if (modelStatusCode === MODEL_QUEUED_FOR_TRAINING || modelStatusCode === MODEL_TRAINING) {
          _this2.pollTimeout = setTimeout(function () {
            return _this2._pollTrain(resolve, reject);
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
    *       @param {string}                     inputs[].image.(url|base64)  Can be a publicly accessibly url or base64 string representing image bytes (required)
    * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
    */

  }, {
    key: 'predict',
    value: function predict(inputs) {
      if (checkType(/(Object|String)/, inputs)) {
        inputs = [inputs];
      }
      var url = '' + this._config.apiEndpoint + (this.versionId ? replaceVars(VERSION_PREDICT_PATH, [this.id, this.versionId]) : replaceVars(PREDICT_PATH, [this.id]));
      return wrapToken(this._config, function (headers) {
        var params = {
          'inputs': inputs.map(formatImagePredict)
        };
        return axios.post(url, params, { headers: headers });
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
        return axios.get(url, data);
      });
    }
    /**
    * Returns all the model's output info
    * @return {Promise(Model, error)} A Promise that is fulfilled with the API response or rejected with an error
    */

  }, {
    key: 'getOutputInfo',
    value: function getOutputInfo() {
      var _this3 = this;

      var url = '' + this._config.apiEndpoint + replaceVars(MODEL_OUTPUT_PATH, [this.id]);
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.get(url, { headers: headers }).then(function (response) {
            resolve(new Model(_this3._config, response.data.model));
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
        return axios.get(url, {
          params: { 'per_page': options.perPage, 'page': options.page },
          headers: headers
        });
      });
    }
  }]);

  return Model;
}();

;

module.exports = Model;