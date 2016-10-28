let axios = require('axios');
let Input = require('./Input');
let {API, replaceVars} = require('./constants');
let {INPUT_PATH, INPUTS_PATH, INPUTS_STATUS_PATH, SEARCH_PATH} = API;
let {wrapToken, formatInput, formatImagesSearch, formatConceptsSearch} = require('./utils');
let {isSuccess, checkType} = require('./helpers');
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
  list(options={page: 1, perPage: 20}) {
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
  * @param {object|object[]}        inputs                                Can be a single media object or an array of media objects (max of 128 inputs/call; passing > 128 will throw an exception)
  *   @param {object|string}          inputs[].input                        If string, is given, this is assumed to be an image url
  *     @param {string}                 inputs[].input.(url|base64)           Can be a publicly accessibly url or base64 string representing image bytes (required)
  *     @param {string}                 inputs[].input.id                     ID of input (optional)
  *     @param {number[]}               inputs[].input.crop                   An array containing the percent to be cropped from top, left, bottom and right (optional)
  *     @param {object[]}               inputs[].input.metadata               Object with key values to attach to the input (optional)
  *     @param {object[]}               inputs[].input.concepts               An array of concepts to attach to media object (optional)
  *       @param {object|string}          inputs[].input.concepts[].concept     If string, is given, this is assumed to be concept id with value equals true
  *         @param {string}                 inputs[].input.concepts[].concept.id          The concept id (required)
  *         @param {boolean}                inputs[].input.concepts[].concept.value       Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  *       @param {string}                 inputs[].input.concepts[].<key>       <key> can be any string with any <value>
  * @return {Promise(inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
  */
  create(inputs) {
    if (checkType(/(String|Object)/, inputs)) {
      inputs = [inputs];
    }
    let url = `${this._config.apiEndpoint}${INPUTS_PATH}`;
    if (inputs.length > MAX_BATCH_SIZE) {
      throw new Error(`Number of inputs exceeded maximum of ${MAX_BATCH_SIZE}`);
    }
    return wrapToken(this._config, (headers)=> {
      let data = {
        'inputs': inputs.map(formatInput)
      };
      return new Promise((resolve, reject)=> {
        axios.post(url, data, {headers})
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
  * Delete an input or a list of inputs by id or all inputs if no id is passed
  * @param {string|string[]}    id           The id of input to delete (optional)
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  delete(id=null) {
    let val;
    // delete an input
    if (checkType(/String/, id)) {
      let url = `${this._config.apiEndpoint}${replaceVars(INPUT_PATH, [id])}`;
      val = wrapToken(this._config, (headers)=> {
        return axios.delete(url, {headers});
      });
    } else {
      val = this._deleteInputs(id);
    }
    return val;
  }
  _deleteInputs(id=null) {
    let url = `${this._config.apiEndpoint}${INPUTS_PATH}`;
    return wrapToken(this._config, (headers)=> {
      let data = id === null? {'delete_all': true}:
        {'ids': id};
      return axios({
        url,
        method: 'delete',
        headers,
        data
      });
    });
  }
  /**
  * Merge concepts to inputs in bulk
  * @param {object[]}         inputs    List of concepts to update (max of 128 inputs/call; passing > 128 will throw an exception)
  *   @param {object}           inputs[].input
  *     @param {string}           inputs[].input.id        The id of the input to update
  *     @param {string}           inputs[].input.concepts  Object with keys explained below:
  *       @param {object}           inputs[].input.concepts[].concept
  *         @param {string}           inputs[].input.concepts[].concept.id        The concept id (required)
  *         @param {boolean}          inputs[].input.concepts[].concept.value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @return {Promise(inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
  */
  mergeConcepts(inputs) {
    return this._update('merge_concepts', inputs);
  }
  /**
  * Delete concepts to inputs in bulk
  * @param {object[]}         inputs    List of concepts to update (max of 128 inputs/call; passing > 128 will throw an exception)
  *   @param {object}           inputs[].input
  *     @param {string}           inputs[].input.id        The id of the input to update
  *     @param {string}           inputs[].input.concepts  Object with keys explained below:
  *       @param {object}           inputs[].input.concepts[].concept
  *         @param {string}           inputs[].input.concepts[].concept.id        The concept id (required)
  *         @param {boolean}          inputs[].input.concepts[].concept.value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @return {Promise(inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
  */
  deleteConcepts(inputs) {
    return this._update('delete_concepts', inputs);
  }
  _update(action, inputs) {
    let url = `${this._config.apiEndpoint}${INPUTS_PATH}`;
    if (checkType(/Object/, inputs)) {
      inputs = [inputs];
    }
    if (inputs.length > MAX_BATCH_SIZE) {
      throw new Error(`Number of inputs exceeded maximum of ${MAX_BATCH_SIZE}`);
    }
    let data = {
      action,
      'inputs': inputs.map((input)=> formatInput(input, false))
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
  *   @param {object[]}               queries          List of all predictions to match with
  *     @param {object}                 queries[].concept            An object with the following keys:
  *       @param {string}                 queries[].concept.type        Search over 'input' or 'output' (default: 'output')
  *       @param {string}                 queries[].concept.name        The concept name
  *       @param {boolean}                queries[].concept.value       Indicates whether or not the term should match with the prediction returned (default: true)
  *     @param {object}                 queries[].image              An image object that contains the following keys:
  *       @param {string}                 queries[].image.type          Search over 'input' or 'output' (default: 'output')
  *       @param {string}                 queries[].image.(base64|url)  Can be a publicly accessibly url or base64 string representing image bytes (required)
  *       @param {number[]}               queries[].image.crop          An array containing the percent to be cropped from top, left, bottom and right (optional)
  *       @param {object}                 queries[].image.metadata      An object with <key> and <value> specified by user to refine search with (optional)
  * @param {Object}                   options       Object with keys explained below: (optional)
  *    @param {Number}                  options.page          The page number (optional, default: 1)
  *    @param {Number}                  options.perPage       Number of images to return per page (optional, default: 20)
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  search(ands=[], options={page: 1, perPage: 20}) {
    let formattedAnds = [];
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

    if (!Array.isArray(ands)) {
      ands = [ands];
    }
    if (ands.length > 0) {
      ands.forEach(function(andQuery) {
        let el = andQuery.name? formatConceptsSearch(andQuery): formatImagesSearch(andQuery);
        formattedAnds = formattedAnds.concat(el);
      });
      data['query']['ands'] = formattedAnds;
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
