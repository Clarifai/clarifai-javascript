'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');

var _require = require('./constants');

var API = _require.API;
var INPUTS_PATH = API.INPUTS_PATH;

/**
* class representing an input
* @class
*/

var Input = function () {
  function Input(_config, data) {
    _classCallCheck(this, Input);

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


  _createClass(Input, [{
    key: 'toObject',
    value: function toObject() {
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

  }, {
    key: 'mergeConcepts',
    value: function mergeConcepts(concepts) {
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

  }, {
    key: 'deleteConcepts',
    value: function deleteConcepts(concepts) {
      return this._update('delete_concepts', concepts);
    }
  }, {
    key: '_update',
    value: function _update(concepts) {
      var url = '' + this._config.apiEndpoint + INPUTS_PATH;
      var data = {
        action: action,
        inputs: [{
          id: this.id,
          data: { concepts: concepts }
        }]
      };
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          return axios.patch(url, data, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              resolve(new Input(response.data.input));
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
  }]);

  return Input;
}();

;

module.exports = Input;