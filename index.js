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

module.exports = global.Clarifai = {
  initialize: function(options) {
    config.set('apiEndpoint', options.apiEndpoint || process.env.API_ENDPOINT || 'https://api.clarifai.com');
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
  * @param {Object|Array}    options  Object or Array of Objects with keys explained below:
  *    @param {Object}    image  Object with keys explained below:
  *       @param {String}    url  A url to visually search against
  *       @param {Array}     crop  [top, left, bottom, right], each specified in the range 0-1.0 (optional)
  *    @param {Array}    tags  An Array of objects with keys explained below:
  *       @param {Object}    concept  Object with keys explained below:
  *          @param {String}  id  A concept id
  *          @param {Boolean}  value  Whether the concept is present or not in the input
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  addInputs: function(options, _callback) {
    var promise = inputs.add(options);
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
  * @method updateInputById
  * @param {String}    id  The input id
  * @param {Object}    options  Object with keys explained below:
  *    @param {Object}    image  Object with keys explained below:
  *       @param {String}    url  A url to visually search against
  *       @param {Array}     crop  [top, left, bottom, right], each specified in the range 0-1.0 (optional)
  *    @param {Array}    tags  An Array of objects with keys explained below:
  *       @param {Object}    concept  Object with keys explained below:
  *          @param {String}  id  A concept id
  *          @param {Boolean}  value  Whether the concept is present or not in the input
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  updateInputById: function(id, options, _callback) {
    var promise = inputs.updateById(id, options);
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
    var promise = inputs.deleteById(id);
    callback.handle(promise, _callback);
    return promise;
  },
  /**
  * Create a new model
  * @method createModel
  * @param {Object}    options  Object with keys explained below:
  *    @param {String}    name  The name of the model
  *    @param {Array}    concepts  An Array of Objects with keys explained below:
  *       @param {String}    id  The name of the concept you'd like to add to the model
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  createModel: function(options, _callback) {
    var promise = models.create(options);
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
  * Attach Model Outputs
  * @method attachModelOutputs
  * @param {String}    modelId  The id of the model to make a prediction from
  * @param {Object}    options  Object with keys explained below:
  *    @param {Array}    inputs  An Array of Objects with keys explained below:
  *       @param {Object}    image  Object with keys explained below:
  *          @param {String}  url  Url of an image to make a prediction on
  * @return {Promise(token, error)} A Promise that is fulfilled with the API response or rejected with an error
  */
  attachModelOutputs: function(modelId, options, _callback) {
    var promise = models.attachOutputs(modelId, options);
    callback.handle(promise, _callback);
    return promise;
  }
};
