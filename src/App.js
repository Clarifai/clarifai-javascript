let axios = require('axios');
let es6Promise = require('es6-promise');
let {Promise} = es6Promise;
let Models = require('./Models');
let Inputs = require('./Inputs');
let Concepts = require('./Concepts');
let constants = require('./constants');
let {API} = constants;
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
    if (typeof _token === 'string') {
      token = {
        'access_token': _token,
        'expires_in': 176400
      };
    }
    if (token.access_token && token.expires_in) {
      this._config['_token'] = token;
      return true;
    }
    return false;
  }
  _validate(clientId, clientSecret, options) {
    if (clientId === undefined || clientSecret === undefined) {
      throw new Error('Client ID and client secret is required');
    }
  }
  _init(clientId, clientSecret, options={}) {
    this._config = {
      'apiEndpoint': options.apiEndpoint ||
        (process && process.env && process.env.API_ENDPOINT) ||
        'https://api.clarifai.com',
      'clientId': clientId,
      'clientSecret': clientSecret,
      '_token': null,
      token: ()=> {
        return new Promise((resolve, reject)=> {
          let now = new Date().getTime();
          if (this._config._token !== null && this._config._token.expireTime > now) {
            resolve(this._config._token);
          } else {
            this._getToken(resolve, reject);
          }
        });
      }
    };
    this.models = new Models(this._config);
    this.inputs = new Inputs(this._config);
    this.concepts = new Concepts(this._config);
  }
  _getToken(resolve, reject) {
    this._requestToken().then(
      (response)=> {
        if (response.status === 200) {
          let token = response.data;
          let now = new Date().getTime();
          token.expireTime = now + (token.expires_in * 1000);
          this.setToken(token);
          resolve(token);
        } else {
          reject(response);
        }
      },
      reject
    );
  }
  _requestToken() {
    let url = `${this._config['apiEndpoint']}${TOKEN_PATH}`;
    let clientId = this._config['clientId'];
    let clientSecret = this._config['clientSecret'];
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
