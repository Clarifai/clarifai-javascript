let axios = require('axios');
let {Promise}  = require('es6-promise');
let {checkType} = require('./helpers');
let Models = require('./Models');
let Inputs = require('./Inputs');
let Concepts = require('./Concepts');
let {API, ERRORS}  = require('./constants');
let {TOKEN_PATH} = API;


/**
* top-level class that allows access to models, inputs and concepts
* @class
*/
class App {
  constructor(clientId, clientSecret, options) {
    this._validate(clientId, clientSecret, options);
    this._init(clientId, clientSecret, options);
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
  _validate(clientId, clientSecret, options) {
    if ((!clientId || !clientSecret) && !options.token) {
      throw ERRORS.paramsRequired(['Client ID', 'Client Secret']);
    }
  }
  _init(clientId, clientSecret, options={}) {
    this._config = {
      apiEndpoint: options.apiEndpoint ||
        (process && process.env && process.env.API_ENDPOINT) ||
        'https://api.clarifai.com',
      clientId,
      clientSecret,
      token: ()=> {
        return new Promise((resolve, reject)=> {
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
  }
  _getToken(resolve, reject) {
    this._requestToken().then(
      (response)=> {
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
    let url = `${this._config.apiEndpoint}${TOKEN_PATH}`;
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
};

module.exports = App;
