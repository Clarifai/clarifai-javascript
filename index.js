var config = require('./lib/config');
var token = require('./lib/token');
var tag = require('./lib/tag');
var info = require('./lib/info');
var languages = require('./lib/languages');
var callback = require('./lib/callback');
var color = require('./lib/color');
var feedback = require('./lib/feedback');
var usage = require('./lib/usage');
var inputs = require('./lib/inputs');
var models = require('./lib/models');
var search = require('./lib/search');
var concepts = require('./lib/concepts');

module.exports = global.Clarifai = {
  initialize: function(options) {
    config.set('apiEndpoint', options.apiEndpoint || process.env.API_ENDPOINT || 'https://api2-prod.clarifai.com');
    config.set('clientId', options.clientId || process.env.CLIENT_ID);
    config.set('clientSecret', options.clientSecret || process.env.CLIENT_SECRET);
    token.delete();
  },
  /**
  * Gets a token from the API using client credentials
  * @method getToken
  * @param {Function}    callback    A node-style calback function that accepts err, token (optional)
  * @return {Promise(token, error)} A Promise that is fulfilled with the token string or rejected with an error
  */
  getToken: function(_callback) {
    var promise = token.get();
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Sets the token to use for the API
  * @method setToken
  * @param {String}    _token    The token you are setting
  * @return {Boolean} true if token has valid fields, false if not
  */
  setToken: function(_token) {
    return token.set(_token);
  },
  /**
  * Deletes the token
  * @method deleteToken
  */
  deleteToken: function() {
    token.delete();
  },
  /**
  * Gets tags given a url
  * @method getTagsByUrl
  * @param {String} or {Array}      url             A publicly accessible url of the image.
  * @param {Object}                 options         Object with keys explained below: (optional)
  *    @param {String}              model           The model used to tag the image (optional)
  *    @param {String}              language        The language used to tag the image (optional)
  *    @param {String} or {Array}   selectClasses   Restrict the tags returned
  *    @param {String} or {Array}   localId         Provide a localId for each url to simplify tracking requests (optional)
  * @param {Function}                               A node-style calback function that accepts err, token (optional)
  * @return {Promise(token, error)}                  A Promise that is fulfilled with the API response or rejected with an error
  */
  getTagsByUrl: function(url, options, _callback) {
    var callbackFn = _callback;
    if ( typeof options === 'function' ) {
      callbackFn = options;
    };
    var promise = tag.getByUrl(url, options);
    callback.handle(promise, callbackFn);
    return promise;
  },
  /**
  * Gets tags given image bytes
  * @method getTagsByImageBytes
  * @param {String}                 image bytes     Base64 encoded image bytes.
  * @param {Object}                 options         Object with keys explained below: (optional)
  *    @param {String}              model           The model used to tag the image (optional)
  *    @param {String}              language        The language used to tag the image (optional)
  *    @param {String} or {Array}   selectClasses   Restrict the tags returned
  *    @param {String} or {Array}   localId         Provide a localId for each url to simplify tracking requests (optional)
  * @param {Function}                               A node-style calback function that accepts err, token (optional)
  * @return {Promise(token, error)}                  A Promise that is fulfilled with the API response or rejected with an error
  */
  getTagsByImageBytes: function(imageBytes, options, _callback) {
    var callbackFn = _callback;
    if ( typeof options === 'function' ) {
      callbackFn = options;
    };
    var promise = tag.getByImageBytes(imageBytes, options);
    callback.handle(promise, callbackFn);
    return promise;
  },
  /**
  * Gets API info
  * @method getInfo
  * @param {Function}    callback    A node-style calback function that accepts err, token (optional)
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  getInfo: function(_callback) {
    var promise = info.get();
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Gets languages supported by the API
  * @method getLanguages
  * @param {Function}    callback    A node-style calback function that accepts err, token (optional)
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  getLanguages: function(_callback) {
    var promise = languages.get();
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Gets colors given a url
  * @method getColorByUrl
  * @param {String} or {Array}   url    A publicly accessible url of the image.
  * @param {Function} A node-style calback function that accepts err, token (optional)
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  getColorsByUrl: function(url, _callback) {
    var promise = color.getByUrl(url);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Gets colors given image bytes
  * @method getColorsByImageBytes
  * @param {String}                  url    A publicly accessible url of the image.
  * @param {Function}                       A node-style calback function that accepts err, token (optional)
  * @return {Promise(token, error)}          A Promise that is fulfilled with the API response or rejected with an error
  */
  getColorsByImageBytes: function(imageBytes, _callback) {
    var promise = color.getByImageBytes(imageBytes);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Gets API usage
  * @method getUsage
  * @param {Function}    callback    A node-style calback function that accepts err, token (optional)
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  getUsage: function(_callback) {
    var promise = usage.get();
    callback.handle(promise, _callback);
    return promise;
  },
   /**
  * Provide feedback for a url or list of urls
  * @method createFeedback
  * @param {String} or {Array}   url    A publicly accessible url of the image.
  * @param {Object}    options  Object with keys explained below: (optional)
  *    @param {String} or {Array}    addTags  Add additional tags that are relevant to the given image(s) (optional)
  *    @param {String} or {Array}    removeTags  Remove tags that are not relevant to the given image(s) (optional)
  *    @param {String} or {Array}    similarUrls  Tell the system two or more images are similar (optional)
  *    @param {String} or {Array}    disSimilarUrls  Tell the system two or more images are dissimilar (optional)
  *    @param {String} or {Array}    searchClick    Tell the system that the search result was relevant to the query (optional)
  * @param {Function} A node-style calback function that accepts err, token (optional)
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  createFeedback: function(url, options, _callback) {
    var callbackFn = _callback;
    if ( typeof options === 'function' ) {
      callbackFn = options;
    };
    var promise = feedback.create(url, options);
    callback.handle(promise, callbackFn);
    return promise;
  },
  /**
  * Adds an input or multiple inputs
  * @method addInputs
  * @param {object|array<object>}   media       Can be a single media object or an array of media objects
  *   @param {object}                 mediaObject
  *     @param {string}                 (url|base64)  Can be a publicly accessibly url or base64 string representing image bytes (required)
  *     @param {string}                 inputId       ID of input (optional)
  *     @param {array<number>}          crop          An array containing the percent to be cropped from top, left, bottom and right (optional)
  *     @param {array<object>}          concepts      An array of concepts to attach to media object (optional)
  *       @param {object}                 concept
  *         @param {string}                 id          The concept id (required)
  *         @param {boolean}                value       Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @param {object}                 options     Object with keys explained below: (optional)
  *   @param {boolean}                trainAfter  A boolean to indicate whether to train model after all inputs given are added
  * @return {Promise(token, error)}             A Promise that is fulfilled with the API response or rejected with an error
  */
  addInputs: function(media, options, _callback) {
    if (Object.prototype.toString.call(media) === '[object Object]') {
      media = [media]
    }
    var promise = inputs.add(media, options);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Get inputs
  * @method getInputs
  * @param {Object}    options  Object with keys explained below: (optional)
  *    @param {Number}    page  The page number (optional, default: 1)
  *    @param {Number}    perPage  Number of images to return per page (optional, default: 20)
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  getInputs: function(options, _callback) {
    var promise = inputs.get(options);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Get input by id
  * @method getInputById
  * @param {String}    id  The input id
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  getInputById: function(id, _callback) {
    var promise = inputs.getById(id);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Get inputs status
  * @method getInputsStatus
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  getInputsStatus: function(_callback) {
    var promise = inputs.getStatus();
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Update input by id
  * @method updateInput
  * @param {string}           id          The input id
  * @param {array<object>}    concepts    Object with keys explained below:
  *   @param {object}           concept
  *     @param {string}           id        The concept id (required)
  *     @param {boolean}          value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @param {string}           action      Valid actions are "delete_concepts" or "merge_concepts" (required)
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  updateInput: function(id, concepts, action, _callback) {
    var promise = inputs.updateById(id, concepts, action);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Update input concepts with the action passed
  * @method updateConcepts
  * @param {array<string>}    inputs    List of inputs to update
  *   @param {object}           input
  *     @param {string}           id        The id of the input to update
  *     @param {string}           concepts  Object with keys explained below:
  *       @param {object}           concept
  *         @param {string}           id        The concept id (required)
  *         @param {boolean}          value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @param {string}           action    Valid actions are "merge_concepts", "delete_concepts"
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  updateConcepts: function(inputs, action, _callback) {
    var promise = inputs.updateConcepts(inputs, action);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Delete an input by id
  * @method deleteInputById
  * @param {String}    id  The input id
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  deleteInputById: function(id, _callback) {
    var promise = inputs.delete(id);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Delete all inputs
  * @method deleteInputs
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  deleteInputs: function(_callback) {
    var promise = inputs.delete();
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Returns all the models
  * @method getModels
  * @param {Object}     options     Object with keys explained below: (optional)
  *    @param {Number}    page        The page number (optional, default: 1)
  *    @param {Number}    perPage     Number of images to return per page (optional, default: 20)
  * @param {Function}   callback    A node-style calback function that accepts err, token (optional)
  * @return {Promise(token, error)} A Promise that is fulfilled with the token string or rejected with an error
  */
  getModels: function(options, _callback) {
    var promise = models.get(options);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Returns a model specified by ID
  * @method getModel
  * @param {String}     modelId     The model's id
  * @param {Function}   _callback   A node-style calback function that accepts err, token (optional)
  * @return {Promise(token, error)} A Promise that is fulfilled with the token string or rejected with an error
  */
  getModel: function(modelId, _callback) {
    var promise = models.get(null, {
      modelId: modelId
    });
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Returns all the model's output info
  * @method getModelOutputInfo
  * @param {String}     modelId     The model's id
  * @param {Function}   _callback   A node-style calback function that accepts err, token (optional)
  * @return {Promise(token, error)} A Promise that is fulfilled with the token string or rejected with an error
  */
  getModelOutputInfo: function(modelId, _callback) {
    var promise = models.get(null, {
      modelId: modelId,
      outputInfo: true
    });
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Returns a list of versions of the model specified by id
  * @method getModelVersions
  * @param {String}     modelId     The model's id
  * @param {Object}     options     Object with keys explained below: (optional)
  *    @param {Number}    page        The page number (optional, default: 1)
  *    @param {Number}    perPage     Number of images to return per page (optional, default: 20)
  * @param {Function}   _callback   A node-style calback function that accepts err, token (optional)
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  getModelVersions: function(modelId, options, _callback) {
    var promise = models.get(options, {
      modelId: modelId,
      versions: true
    });
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Returns a version of the model specified by model and version id
  * @method getModelVersion
  * @param {String}     modelId     The model's id
  * @param {String}     versionId   The model's id
  * @param {Function}   _callback   A node-style calback function that accepts err, token (optional)
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  getModelVersion: function(modelId, versionId, _callback) {
    var promise = models.get(null, {
      modelId: modelId,
      versionId: versionId
    });
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Search for models by name or type
  * @method searchModels
  * @param {String}     name        The model name
  * @param {String}     type        This can be "concept", "color", "embed", "facedetect", "cluster" or "blur"
  * @param {Object}     options     Object with keys explained below: (optional)
  *    @param {Number}    page        The page number (optional, default: 1)
  *    @param {Number}    perPage     Number of images to return per page (optional, default: 20)
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  searchModels: function(name, type, options, _callback) {
    var promise = models.search(name, type, options);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Create a model
  * @method createModel
  * @param {string}         name            The model's id
  * @param {array<object>}  conceptIds      List of concept object with id
  * @param {Object}         options         Object with keys explained below:
  *   @param {Boolean}        oneVsAll        Optional
  *   @param {Boolean}        useModelInWild  Optional
  * @param {Function}       _callback       A node-style calback function that accepts err, token (optional)
  * @return {Promise(token, error)}     A Promise that is fulfilled with the API response or rejected with an error
  */
  createModel: function(name, conceptIds, options, _callback) {
    var promise = models.create(name, conceptIds, options);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Add / Remove tags from a model
  * @method updateModelConcepts
  * @param {String}     modelId     The model's id
  * @param {Object}     data        Object with keys explained below:
  *   @param {Array}      concepts    List of concept objects with id
  *   @param {String}     action      A string to indicate the action to do with the list of concepts ("add", "remove")
  * @param {Function}   _callback   A node-style calback function that accepts err, token (optional)
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  updateModelConcepts: function(modelId, data, _callback) {
    var promise = models.updateConcepts(modelId, data);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Create a new model version
  * @method createModelVersion
  * @param {String}    modelId  The id of the model to train
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  createModelVersion: function(modelId, _callback) {
    var promise = models.createVersion(modelId);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Create Model Outputs
  * @method createOutputs
  * @param {string|object}  id        If string is given, it is considered the id of the model to predict from. Otherwise, if object, it should have the following keys:
  *   @param {string}         modelId   The model id (required)
  *   @param {string}         versionId The id of the version of the model referred to above (optional)
  * @param {array<object>}  inputs    An Array of Objects with keys explained below:
  *    @param {object}        image     Object with keys explained below:
  *       @param {string}       url       Url of an image to make a prediction on
  * @param {string}         versionId The id of the model version to attach outputs to (optional)
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  createOutputs: function(modelId, inputs, _callback) {
    var promise = models.createOutputs(modelId, inputs);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * @method searchInputs
  * @param {array<string|object>}     images      An array of image urls to search for similar inputs (optional)
  *   @param {object}                   image       An object that contains the following
  *     @param {string}                   url         Publicly accessible url of image
  *     @param {array<number>}            crop          An array containing the percent to be cropped from top, left, bottom and right (optional)
  * @param {object}                   tags        An object containing any of the following queries: (optional)
  *   @param {array<object>}            ands        List of all predictions to match with
  *     @param {object}                   and
  *       @param {string}                   term      The concept term
  *       @param {boolean}                  value     Indicates whether or not the term should match with the prediction returned (default: true)
  *   @param {array<object>}            ors         List of any predictions to match with
  *     @param {object}                  or
  *       @param {string}                  term      The concept term
  *       @param {boolean}                 value     Indicates whether or not the term should match with the prediction returned (default: true)
  * @param {Object}     options     Object with keys explained below: (optional)
  *    @param {Number}    page        The page number (optional, default: 1)
  *    @param {Number}    perPage     Number of images to return per page (optional, default: 20)
  * @return {Promise(token, error)} A Promise that is fulfilled with the token string or rejected with an error
  */
  searchInputs: function(image, tags, options, _callback) {
    var promise = search.searchInputs(image, tags, options);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * List all the concepts
  * @method getConcepts
  * @param {Object}     options     Object with keys explained below: (optional)
  *    @param {Number}    page        The page number (optional, default: 1)
  *    @param {Number}    perPage     Number of images to return per page (optional, default: 20)
  * @return {Promise(token, error)} A Promise that is fulfilled with the token string or rejected with an error
  */
  getConcepts: function(options, _callback) {
    var promise = concepts.get(null, options);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * List a single concept given an id
  * @method getConcept
  * @param {String}     id          The concept's id
  * @return {Promise(token, error)} A Promise that is fulfilled with the token string or rejected with an error
  */
  getConcept: function(id, options, _callback) {
    var promise = concepts.get(id, options);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Add a list of concepts given an id and name
  * @method addConcept
  * @param  {array<object>}   concepts  List of concept objects
  *   @param  {object}          concept
  *     @param  {object}          id      The new concept's id
  *     @param  {object}          name    The new concept's name
  * @return {Promise(token, error)}     A Promise that is fulfilled with the token string or rejected with an error
  */
  addConcepts: function(concepts, _callback) {
    var promise = concepts.add(concepts, options);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Search for a concept given a name. A wildcard can be given (example: The name "bo*" will match with "boat" and "bow" given those concepts exist
  * @method searchConcepts
  * @param  {string}   name  The name of the concept to search for
  * @return {Promise(token, error)} A Promise that is fulfilled with the token string or rejected with an error
  */
  searchConcepts: function(name, _callback) {
    var promise = concepts.search(name, options);
    callback.handle(promise, _callback);
    return promise;
  }
};
