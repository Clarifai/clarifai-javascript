'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');

var _require = require('es6-promise'),
    Promise = _require.Promise;

var _require2 = require('./helpers'),
    checkType = _require2.checkType;

var Models = require('./Models');
var Inputs = require('./Inputs');
var Concepts = require('./Concepts');

var _require3 = require('./constants'),
    API = _require3.API,
    ERRORS = _require3.ERRORS;

var TOKEN_PATH = API.TOKEN_PATH;

/**
* top-level class that allows access to models, inputs and concepts
* @class
*/

var App = function () {
  function App(clientId, clientSecret, options) {
    _classCallCheck(this, App);

    this._validate(clientId, clientSecret, options);
    this._init(clientId, clientSecret, options);
  }
  /**
  * Gets a token from the API using client credentials
  * @return {Promise(token, error)} A Promise that is fulfilled with the token string or rejected with an error
  */


  _createClass(App, [{
    key: 'getToken',
    value: function getToken() {
      return this._config.token();
    }
    /**
    * Sets the token to use for the API
    * @param {String}         _token    The token you are setting
    * @return {Boolean}                 true if token has valid fields, false if not
    */

  }, {
    key: 'setToken',
    value: function setToken(_token) {
      var token = _token;
      var now = new Date().getTime();
      if (typeof _token === 'string') {
        token = {
          accessToken: _token,
          expiresIn: 176400
        };
      } else {
        token = {
          accessToken: _token.access_token || _token.accessToken,
          expiresIn: _token.expires_in || _token.expiresIn
        };
      }
      if (token.accessToken && token.expiresIn || token.access_token && token.expires_in) {
        if (!token.expireTime) {
          token.expireTime = now + token.expiresIn * 1000;
        }
        this._config._token = token;
        return true;
      }
      return false;
    }
  }, {
    key: '_validate',
    value: function _validate(clientId, clientSecret, options) {
      if ((!clientId || !clientSecret) && !options.token) {
        throw ERRORS.paramsRequired(['Client ID', 'Client Secret']);
      }
    }
  }, {
    key: '_init',
    value: function _init(clientId, clientSecret) {
      var _this = this;

      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      this._config = {
        apiEndpoint: options.apiEndpoint || process && process.env && process.env.API_ENDPOINT || 'https://api.clarifai.com',
        clientId: clientId,
        clientSecret: clientSecret,
        token: function token() {
          return new Promise(function (resolve, reject) {
            var now = new Date().getTime();
            if (checkType(/Object/, _this._config._token) && _this._config._token.expireTime > now) {
              resolve(_this._config._token);
            } else {
              _this._getToken(resolve, reject);
            }
          });
        }
      };
      if (options.token) {
        this.setToken(options.token);
      }
      this.models = new Models(this._config);
      this.inputs = new Inputs(this._config);
      this.concepts = new Concepts(this._config);
    }
  }, {
    key: '_getToken',
    value: function _getToken(resolve, reject) {
      var _this2 = this;

      this._requestToken().then(function (response) {
        if (response.status === 200) {
          _this2.setToken(response.data);
          resolve(_this2._config._token);
        } else {
          reject(response);
        }
      }, reject);
    }
  }, {
    key: '_requestToken',
    value: function _requestToken() {
      var url = '' + this._config.apiEndpoint + TOKEN_PATH;
      var clientId = this._config.clientId;
      var clientSecret = this._config.clientSecret;
      return axios({
        'url': url,
        'method': 'POST',
        'auth': {
          'username': clientId,
          'password': clientSecret
        }
      });
    }
  }]);

  return App;
}();

;

module.exports = App;