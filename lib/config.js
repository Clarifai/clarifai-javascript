var config = {
  'apiEndpoint': undefined,
  'clientId': undefined,
  'clientSecret': undefined,
  'token': undefined
};

module.exports = {
  get: function(key) {
    return config[key];
  },
  set: function(key, value) {
    if (value) {
      config[key] = value;
    }
  },
  delete: function(key) {
    config[key] = undefined;
  }
};