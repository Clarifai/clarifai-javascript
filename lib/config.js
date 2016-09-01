var config = {
  'apiEndpoint': undefined,
  'clientId': process.env.CLIENT_ID,
  'clientSecret': process.env.CLIENT_SECRET,
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
