let axios = require('axios');
let Input = require('./Input');
let {API, replaceVars} = require('./constants');
let {INPUT_PATH, INPUTS_PATH, INPUTS_STATUS_PATH, SEARCH_PATH} = API;
let {wrapToken, formatInput, formatImagesSearch, formatConceptsSearch} = require('./utils');
let {isSuccess} = require('./helpers');
const MAX_BATCH_SIZE = 128;

/**
* class representing a collection of inputs
* @class
*/
class Inputs {
  constructor(_config, rawData=[]) {
    this._config = _config;
    this.rawData = rawData;
    rawData.forEach((inputData, index)=> {
      if (inputData.input && inputData.score) {
        inputData.input.score = inputData.score;
        inputData = inputData.input;
      }
      this[index] = new Input(this._config, inputData);
    });
    this.length = rawData.length;
  }
  /**
  * Get all inputs in app
  * @param {Object}    options  Object with keys explained below: (optional)
  *   @param {Number}    options.page  The page number (optional, default: 1)
  *   @param {Number}    options.perPage  Number of images to return per page (optional, default: 20)
  * @return {Promise(inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
  */
  list(options) {
    let url = `${this._config.apiEndpoint}${INPUTS_PATH}`;
    return wrapToken(this._config, (headers)=> {
      return new Promise((resolve, reject)=> {
        axios.get(url, {
          headers,
          params: {
            'page': options.page,
            'per_page': options.perPage,
          }
        }).then((response)=> {
          if (isSuccess(response)) {
            resolve(new Inputs(this._config, response.data.inputs));
          } else {
            reject(response);
          }
        }, reject);
      });
    });
  }
  /**
  * Adds an input or multiple inputs
  * @param {object|object[]}        inputs                                Can be a single media object or an array of media objects
  *   @param {object|string}          inputs[].input                        If string, is given, this is assumed to be an image url
  *     @param {string}                 inputs[].input.(url|base64)           Can be a publicly accessibly url or base64 string representing image bytes (required)
  *     @param {string}                 inputs[].input.inputId                ID of input (optional)
  *     @param {number[]}               inputs[].input.crop                   An array containing the percent to be cropped from top, left, bottom and right (optional)
  *     @param {object[]}               inputs[].input.concepts               An array of concepts to attach to media object (optional)
  *       @param {object|string}          inputs[].input.concepts[].concept     If string, is given, this is assumed to be concept id with value equals true
  *         @param {string}                 inputs[].input.concepts[].concept.id          The concept id (required)
  *         @param {boolean}                inputs[].input.concepts[].concept.value       Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @return {Promise(inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
  */
  create(inputs) {
    if (Object.prototype.toString.call(inputs) === '[object Object]') {
      inputs = [inputs];
    }
    let url = `${this._config.apiEndpoint}${INPUTS_PATH}`;
    return wrapToken(this._config, (headers)=> {
      let requests = [];
      inputs = inputs.map(formatInput);
      let batches = Math.ceil(inputs.length/MAX_BATCH_SIZE);
      for (let batch = 0; batch < batches; batch++) {
        let start = batch * MAX_BATCH_SIZE;
        let end = start + MAX_BATCH_SIZE;
        let data = {
          'inputs': inputs.slice(start, end)
        };
        requests.push(
          new Promise((resolve, reject)=> {
            axios.post(url, data, {headers})
            .then((response)=> {
              if (isSuccess(response)) {
                resolve(new Inputs(this._config, response.data.inputs));
              } else {
                reject(response);
              }
            }, reject);
          })
        );
      }
      return new Promise((resolve, reject)=> {
        Promise.all(requests).then((responses)=> {
          let data = responses[0];
          responses.slice(1).forEach((response)=> {
            if (response['inputs']) {
              data['inputs'].push(response['inputs']);
            }
          });
          resolve(data);
        }).catch(reject);
      });
    });
  }
  /**
  * Get input by id
  * @param {String}    id  The input id
  * @return {Promise(input, error)} A Promise that is fulfilled with an instance of Input or rejected with an error
  */
  get(id) {
    let url = `${this._config.apiEndpoint}${replaceVars(INPUT_PATH, [id])}`;
    return wrapToken(this._config, (headers)=> {
      return new Promise((resolve, reject)=> {
        axios.get(url, {headers}).then((response)=> {
          if (isSuccess(response)) {
            resolve(new Input(this._config, response.data.input));
          } else {
            reject(response);
          }
        }, reject);
      });
    });
  }
  /**
  * Delete an input by id or all inputs if id is not passed
  * @param {String}    id           The id of input to delete (optional)
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  delete(id) {
    let url;
    if (id) {
      url = `${this._config.apiEndpoint}${replaceVars(MODEL_VERSION_PATH, [id, versionId])}`;
    } else {
      url = `${this._config.apiEndpoint}${INPUTS_PATH}`;
    }
    return wrapToken(this._config, (headers)=> {
      return axios.delete(url, {headers});
    });
  }
  /**
  * Add concepts to inputs in bulk
  * @param {object[]}         concepts    List of concepts to update
  *   @param {object}           concepts[].input
  *     @param {string}           concepts[].input.id        The id of the input to update
  *     @param {string}           concepts[].input.concepts  Object with keys explained below:
  *       @param {object}           concepts[].input.concepts.concept
  *         @param {string}           concepts[].input.concepts.concept.id        The concept id (required)
  *         @param {boolean}          concepts[].input.concepts.concept.value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @return {Promise(inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
  */
  addConcepts(concepts) {
    return this._update('merge_concepts', concepts);
  }
  /**
  * Delete concepts to inputs in bulk
  * @param {object[]}         concepts    List of concepts to update
  *   @param {object}           concepts[].input
  *     @param {string}           concepts[].input.id        The id of the input to update
  *     @param {string}           concepts[].input.concepts  Object with keys explained below:
  *       @param {object}           concepts[].input.concepts.concept
  *         @param {string}           concepts[].input.concepts.concept.id        The concept id (required)
  *         @param {boolean}          concepts[].input.concepts.concept.value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @return {Promise(inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
  */
  deleteConcepts(concepts) {
    return this._update('delete_concepts', concepts);
  }
  _update(action, concepts) {
    let url = `${this._config.apiEndpoint}${INPUTS_PATH}`;
    let data = {
      action,
      'inputs': concepts.map((concept)=> formatInput(concept, false))
    };
    return wrapToken(this._config, (headers)=> {
      return new Promise((resolve, reject)=> {
        axios.patch(url, data, {headers})
        .then((response)=> {
          if (isSuccess(response)) {
            resolve(new Inputs(this._config, response.data.inputs));
          } else {
            reject(response);
          }
        }, reject);
      });
    });
  }
  /**
  * Search for inputs or outputs based on concepts or images
  * @param {object[]}                 queries       An object containing any of the following queries: (optional)
  *   @param {object[]}                 queries[].ands          List of all predictions to match with
  *     @param {object}                   queries[].ands[].concept            An object with the following keys:
  *       @param {string}                   queries[].ands[].concept.type        Search over 'input' or 'output' (default: 'output')
  *       @param {string}                   queries[].ands[].concept.term        The concept term
  *       @param {boolean}                  queries[].ands[].concept.value       Indicates whether or not the term should match with the prediction returned (default: true)
  *     @param {object}                   queries[].ands[].image              An image object that contains the following keys:
  *       @param {string}                   queries[].ands[].image.type          Search over 'input' or 'output' (default: 'output')
  *       @param {string}                   queries[].ands[].image.(base64|url)  Can be a publicly accessibly url or base64 string representing image bytes (required)
  *       @param {number[]}                 queries[].ands[].image.crop          An array containing the percent to be cropped from top, left, bottom and right (optional)
  *   @param {concept[]|image[]}        queries[].ors           List of any predictions to match with
  *     @param {object}                   queries[].ors[].concept            An object with the following keys:
  *       @param {string}                   queries[].ors[].concept.type          Search over 'input' or 'output' (default: 'output')
  *       @param {string}                   queries[].ors[].concept.term          The concept term
  *       @param {boolean}                  queries[].ors[].concept.value         Indicates whether or not the term should match with the prediction returned (default: true)
  *     @param {object}                   queries[].ors[].image              An image object that contains the following keys:
  *       @param {string}                   queries[].ors[].image.type            Search over 'input' or 'output' (default: 'output')
  *       @param {string}                   queries[].ors[].image.(base64|url)    Can be a publicly accessibly url or base64 string representing image bytes (required)
  *       @param {number[]}                 queries[].ors[].image.crop            An array containing the percent to be cropped from top, left, bottom and right (optional)
  * @param {Object}                   options       Object with keys explained below: (optional)
  *    @param {Number}                  options.page          The page number (optional, default: 1)
  *    @param {Number}                  options.perPage       Number of images to return per page (optional, default: 20)
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  search(queries={}, options={}) {
    let url = `${this._config.apiEndpoint}${SEARCH_PATH}`;
    let data = {
      'query': {
        'ands': []
      },
      'pagination': {
        'page': options.page,
        'per_page': options.perPage
      }
    };
    if (queries && queries.ands && queries.ands.length > 0) {
      data['query']['ands'] = queries.ands.map(function(andQuery) {
        return andQuery.term?
          formatConceptsSearch(andQuery):
          formatImagesSearch(andQuery);
      });
    }
    if (queries && queries.ors && queries.ors.length > 0) {
      data['query']['ands'] = data['query']['ands'].concat({
        'ors': queries.ors.map(function(orQuery) {
          return orQuery.term?
            formatConceptsSearch(orQuery):
            formatImagesSearch(orQuery);
        })
      });
    }
    return wrapToken(this._config, (headers)=> {
      return new Promise((resolve, reject)=> {
        axios.post(url, data, {headers})
        .then((response)=> {
          if (isSuccess(response)) {
            resolve(new Inputs(this._config, response.data.hits));
          } else {
            reject(response);
          }
        }, reject);
      });
    });
  }
  /**
  * Get inputs status (number of uploaded, in process or failed inputs)
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  getStatus() {
    let url = `${this._config.apiEndpoint}${INPUTS_STATUS_PATH}`;
    return wrapToken(this._config, (headers)=> {
      return new Promise((resolve, reject)=> {
        axios.get(url, {headers})
        .then((response)=> {
          if (isSuccess(response)) {
            resolve(response.data);
          } else {
            reject(response);
          }
        }, reject);
      });
    });
  }
};

module.exports = Inputs;
