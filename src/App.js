let axios = require('axios');
let {checkType} = require('./helpers');
let Models = require('./Models');
let Inputs = require('./Inputs');
let Concepts = require('./Concepts');
let Workflow = require('./Workflow');
let {API, ERRORS, getBasePath} = require('./constants');
let {TOKEN_PATH} = API;

if (typeof window !== 'undefined' && !('Promise' in window)) {
  window.Promise = require('promise');
}

if (typeof global !== 'undefined' && !('Promise' in global)) {
  global.Promise = require('promise');
}

/**
 * top-level class that allows access to models, inputs and concepts
 * @class
 */
class App {
  constructor(arg1, arg2, arg3) {
    let optionsObj = arg1;
    if (typeof arg1 !== 'object' || arg1 === null) {
      optionsObj = arg3 || {};
      optionsObj.clientId = arg1;
      optionsObj.clientSecret = arg2;
    }
    this._validate(optionsObj);
    this._init(optionsObj);

  }

  /**
   * Gets a token from the API using client credentials
   * @return {Promise(token, error)} A Promise that is fulfilled with the token string or rejected with an error
   */
  getToken() {
    return this._config.token();
  }

  /**
   * Sets the token to use for the API
   * @param {String}         _token    The token you are setting
   * @return {Boolean}                 true if token has valid fields, false if not
   */
  setToken(_token) {
    let token = _token;
    let now = new Date().getTime();
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
    if ((token.accessToken && token.expiresIn) ||
      (token.access_token && token.expires_in)) {
      if (!token.expireTime) {
        token.expireTime = now + (token.expiresIn * 1000);
      }
      this._config._token = token;
      return true;
    }
    return false;
  }

  _validate({clientId, clientSecret, token, apiKey, sessionToken}) {
    if ((!clientId || !clientSecret) && !token && !apiKey && !sessionToken) {
      throw ERRORS.paramsRequired(['Client ID', 'Client Secret']);
    }
  }

  _init(options) {
    let apiEndpoint = options.apiEndpoint ||
      (process && process.env && process.env.API_ENDPOINT) || 'https://api.clarifai.com';
    this._config = {
      apiEndpoint,
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      apiKey: options.apiKey,
      sessionToken: options.sessionToken,
      basePath: getBasePath(apiEndpoint, options.userId, options.appId),
      token: () => {
        return new Promise((resolve, reject) => {
          let now = new Date().getTime();
          if (checkType(/Object/, this._config._token) && this._config._token.expireTime > now) {
            resolve(this._config._token);
          } else {
            this._getToken(resolve, reject);
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
    this.workflow = new Workflow(this._config);
  }

  _getToken(resolve, reject) {
    this._requestToken().then(
      (response) => {
        if (response.status === 200) {
          this.setToken(response.data);
          resolve(this._config._token);
        } else {
          reject(response);
        }
      },
      reject
    );
  }

  _requestToken() {
    let url = `${this._config.basePath}${TOKEN_PATH}`;
    let clientId = this._config.clientId;
    let clientSecret = this._config.clientSecret;
    return axios({
      'url': url,
      'method': 'POST',
      'auth': {
        'username': clientId,
        'password': clientSecret
      }
    });
  }
}
;

module.exports = App;
