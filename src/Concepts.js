let axios = require('axios');
let Concept = require('./Concept');
let {API, replaceVars} = require('./constants');
let {CONCEPTS_PATH, CONCEPT_PATH, CONCEPT_SEARCH_PATH} = API;
let {wrapToken, formatConcept} = require('./utils');
let {isSuccess, checkType} = require('./helpers');

/**
 * class representing a collection of concepts
 * @class
 */
class Concepts {
  constructor(_config, rawData = []) {
    this._config = _config;
    this.rawData = rawData;
    rawData.forEach((conceptData, index) => {
      this[index] = new Concept(this._config, conceptData);
    });
    this.length = rawData.length;
  }

  /**
   * List all the concepts
   * @param {object}     options     Object with keys explained below: (optional)
   *    @param {number}    options.page        The page number (optional, default: 1)
   *    @param {number}    options.perPage     Number of images to return per page (optional, default: 20)
   * @return {Promise(Concepts, error)} A Promise that is fulfilled with a Concepts instance or rejected with an error
   */
  list(options = {page: 1, perPage: 20}) {
    let url = `${this._config.basePath}${CONCEPTS_PATH}`;
    return wrapToken(this._config, (headers) => {
      return new Promise((resolve, reject) => {
        axios.get(url, {
          headers,
          params: {
            'page': options.page,
            'per_page': options.perPage,
          }
        }).then((response) => {
          if (isSuccess(response)) {
            resolve(new Concepts(this._config, response.data.concepts));
          } else {
            reject(response);
          }
        }, reject);
      });
    });
  }

  /**
   * List a single concept given an id
   * @param {String}     id          The concept's id
   * @return {Promise(Concept, error)} A Promise that is fulfilled with a Concept instance or rejected with an error
   */
  get(id) {
    let url = `${this._config.basePath}${replaceVars(CONCEPT_PATH, [id])}`;
    return wrapToken(this._config, (headers) => {
      return new Promise((resolve, reject) => {
        axios.get(url, {headers}).then((response) => {
          if (isSuccess(response)) {
            resolve(new Concept(this._config, response.data.concept));
          } else {
            reject(response);
          }
        }, reject);
      });
    });
  }

  /**
   * Add a list of concepts given an id and name
   * @param {object|object[]}   concepts       Can be a single media object or an array of media objects
   *   @param  {object|string}    concepts[].concept         If string, this is assumed to be the concept id. Otherwise, an object with the following attributes
   *     @param  {object}           concepts[].concept.id      The new concept's id (Required)
   *     @param  {object}           concepts[].concept.name    The new concept's name
   * @return {Promise(Concepts, error)}             A Promise that is fulfilled with a Concepts instance or rejected with an error
   */
  create(concepts = []) {
    if (checkType(/(Object|String)/, concepts)) {
      concepts = [concepts];
    }
    let data = {
      'concepts': concepts.map(formatConcept)
    };
    let url = `${this._config.basePath}${CONCEPTS_PATH}`;
    return wrapToken(this._config, (headers) => {
      return new Promise((resolve, reject) => {
        axios.post(url, data, {headers})
          .then((response) => {
            if (isSuccess(response)) {
              resolve(new Concepts(this._config, response.data.concepts));
            } else {
              reject(response);
            }
          }, reject);
      });
    });
  }

  /**
   * Search for a concept given a name. A wildcard can be given (example: The name "bo*" will match with "boat" and "bow" given those concepts exist
   * @param  {string}   name  The name of the concept to search for
   * @return {Promise(Concepts, error)} A Promise that is fulfilled with a Concepts instance or rejected with an error
   */
  search(name, language = null) {
    let url = `${this._config.basePath}${CONCEPT_SEARCH_PATH}`;
    return wrapToken(this._config, (headers) => {
      let params = {
        'concept_query': {name, language}
      };
      return new Promise((resolve, reject) => {
        axios.post(url, params, {headers}).then((response) => {
          if (isSuccess(response)) {
            resolve(new Concepts(this._config, response.data.concepts));
          } else {
            reject(response);
          }
        }, reject);
      });
    });
  }
}
;

module.exports = Concepts;
