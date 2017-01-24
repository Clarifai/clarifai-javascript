let axios = require('axios');
let Input = require('./Input');
let {API, ERRORS, MAX_BATCH_SIZE, replaceVars} = require('./constants');
let {INPUT_PATH, INPUTS_PATH, INPUTS_STATUS_PATH, SEARCH_PATH} = API;
let {wrapToken, formatInput, formatImagesSearch, formatConceptsSearch} = require('./utils');
let {isSuccess, checkType, clone} = require('./helpers');

/**
 * class representing a collection of inputs
 * @class
 */
class Inputs {
  constructor(_config, rawData=[]) {
    this.rawData = rawData;
    rawData.forEach((inputData, index)=> {
      if (inputData.input && inputData.score) {
        inputData.input.score = inputData.score;
        inputData = inputData.input;
      }
      this[index] = new Input(this._config, inputData);
    });
    this.length = rawData.length;
    this._config = _config;
  }
  /**
   * Get all inputs in app
   * @param {Object}    options  Object with keys explained below: (optional)
  *   @param {Number}    options.page  The page number (optional, default: 1)
  *   @param {Number}    options.perPage  Number of images to return per page (optional, default: 20)
  * @return {Promise(Inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
  */
  list(options={page: 1, perPage: 20}) {
    let url = `${this._config.apiEndpoint}${INPUTS_PATH}`;
    return wrapToken(this._config, (headers)=> {
      return new Promise((resolve, reject)=> {
        axios.get(url, {
          headers,
          params: {
            page: options.page,
            per_page: options.perPage,
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
  *     @param {object[]}               inputs[].input.metadata               Object with key and values pair (value can be string, array or other objects) to attach to the input (optional)
  *     @param {object}                 inputs[].input.geo                    Object with latitude and longitude coordinates to associate with an input. Can be used in search query as the proximity of an input to a reference point (optional)
  *       @param {number}                 inputs[].input.geo.latitude           +/- latitude val of geodata
  *       @param {number}                 inputs[].input.geo.longitude          +/- longitude val of geodata
  *     @param {object[]}               inputs[].input.concepts               An array of concepts to attach to media object (optional)
  *       @param {object|string}          inputs[].input.concepts[].concept     If string, is given, this is assumed to be concept id with value equals true
  *         @param {string}                 inputs[].input.concepts[].concept.id          The concept id (required)
  *         @param {boolean}                inputs[].input.concepts[].concept.value       Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @return {Promise(Inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
  */
  create(inputs) {
    if (checkType(/(String|Object)/, inputs)) {
      inputs = [inputs];
    }
    let url = `${this._config.apiEndpoint}${INPUTS_PATH}`;
    if (inputs.length > MAX_BATCH_SIZE) {
      throw ERRORS.MAX_INPUTS;
    }
    return wrapToken(this._config, (headers)=> {
      let data = {
        inputs: inputs.map(formatInput)
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
  * @return {Promise(Input, error)} A Promise that is fulfilled with an instance of Input or rejected with an error
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
      let data = id === null? {delete_all: true}:
        {ids: id};
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
  * @return {Promise(Inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
  */
  mergeConcepts(inputs) {
    inputs.action = 'merge';
    return this.update(inputs);
  }
  /**
  * Delete concepts to inputs in bulk
  * @param {object[]}         inputs    List of concepts to update (max of 128 inputs/call; passing > 128 will throw an exception)
  *   @param {object}           inputs[].input
  *     @param {string}           inputs[].input.id                           The id of the input to update
  *     @param {string}           inputs[].input.concepts                     Object with keys explained below:
  *       @param {object}           inputs[].input.concepts[].concept
  *         @param {string}           inputs[].input.concepts[].concept.id        The concept id (required)
  *         @param {boolean}          inputs[].input.concepts[].concept.value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @return {Promise(Inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
  */
  deleteConcepts(inputs) {
    inputs.action = 'remove';
    return this.update(inputs);
  }
  /**
  * Overwrite inputs in bulk
  * @param {object[]}         inputs    List of concepts to update (max of 128 inputs/call; passing > 128 will throw an exception)
  *   @param {object}           inputs[].input
  *     @param {string}           inputs[].input.id                           The id of the input to update
  *     @param {string}           inputs[].input.concepts                     Object with keys explained below:
  *       @param {object}           inputs[].input.concepts[].concept
  *         @param {string}           inputs[].input.concepts[].concept.id        The concept id (required)
  *         @param {boolean}          inputs[].input.concepts[].concept.value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @return {Promise(Inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
  */
  overwriteConcepts(inputs) {
    inputs.action = 'overwrite';
    return this.update(inputs);
  }
  /**
  * @param {object[]}         inputs    List of concepts to update (max of 128 inputs/call; passing > 128 will throw an exception)
  *   @param {object}           inputs[].input
  *     @param {string}           inputs[].input.id                           The id of the input to update
  *     @param {object}           inputs[].input.metadata                     Object with key values to attach to the input (optional)
  *     @param {object}           inputs[].input.geo                          Object with latitude and longitude coordinates to associate with an input. Can be used in search query as the proximity of an input to a reference point (optional)
  *       @param {number}           inputs[].input.geo.latitude                 +/- latitude val of geodata
  *       @param {number}           inputs[].input.geo.longitude                +/- longitude val of geodata
  *     @param {string}           inputs[].input.concepts                     Object with keys explained below (optional):
  *       @param {object}           inputs[].input.concepts[].concept
  *         @param {string}           inputs[].input.concepts[].concept.id        The concept id (required)
  *         @param {boolean}          inputs[].input.concepts[].concept.value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @return {Promise(Inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
  */
  update(inputs) {
    let url = `${this._config.apiEndpoint}${INPUTS_PATH}`;
    let inputsList = Array.isArray(inputs)? inputs: [inputs];
    if (inputsList.length > MAX_BATCH_SIZE) {
      throw ERRORS.MAX_INPUTS;
    }
    let data = {
      action: inputs.action,
      inputs: inputsList.map((input)=> formatInput(input, false))
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
  *       @param {string}                 queries[].concept.id          The concept id
  *       @param {string}                 queries[].concept.type        Search over 'input' to get input matches to criteria or 'output' to get inputs that are visually similar to the criteria (default: 'output')
  *       @param {string}                 queries[].concept.name        The concept name
  *       @param {boolean}                queries[].concept.value       Indicates whether or not the term should match with the prediction returned (default: true)
  *     @param {object}                 queries[].input              An image object that contains the following keys:
  *       @param {string}                 queries[].input.id            The input id
  *       @param {string}                 queries[].input.type          Search over 'input' to get input matches to criteria or 'output' to get inputs that are visually similar to the criteria (default: 'output')
  *       @param {string}                 queries[].input.(base64|url)  Can be a publicly accessibly url or base64 string representing image bytes (required)
  *       @param {number[]}               queries[].input.crop          An array containing the percent to be cropped from top, left, bottom and right (optional)
  *       @param {object}                 queries[].input.metadata      An object with key and value specified by user to refine search with (optional)
  * @param {Object}                   options       Object with keys explained below: (optional)
  *    @param {Number}                  options.page          The page number (optional, default: 1)
  *    @param {Number}                  options.perPage       Number of images to return per page (optional, default: 20)
  * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  search(queries=[], options={page: 1, perPage: 20}) {
    let formattedAnds = [];
    let url = `${this._config.apiEndpoint}${SEARCH_PATH}`;
    let data = {
      query: {
        ands: []
      },
      pagination: {
        page: options.page,
        per_page: options.perPage
      }
    };

    if (!Array.isArray(queries)) {
      queries = [queries];
    }
    if (queries.length > 0) {
      queries.forEach(function(query) {
        if (query.input) {
          formattedAnds = formattedAnds.concat(formatImagesSearch(query.input));
        } else if (query.concept) {
          formattedAnds = formattedAnds.concat(formatConceptsSearch(query.concept));
        }
      });
      data.query.ands = formattedAnds;
    }
    return wrapToken(this._config, (headers)=> {
      return new Promise((resolve, reject)=> {
        axios.post(url, data, {headers})
        .then((response)=> {
          if (isSuccess(response)) {
            let data = clone(response.data);
            data.rawData = clone(response.data);
            resolve(data);
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
            let data = clone(response.data);
            data.rawData = clone(response.data);
            resolve(data);
          } else {
            reject(response);
          }
        }, reject);
      });
    });
  }
};

module.exports = Inputs;
