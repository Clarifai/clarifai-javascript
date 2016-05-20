// utils for helping with the response

module.exports.handleV1 = function(response, resolve, reject) {
  if ( response.status === 200 || response.status === 201 ) {
    resolve(response.data);
  } else {
    reject(response.data);
  }
};

module.exports.errorV1 = function(err, reject) {
  if ( err.data ) {
    reject(err.data);
  } else {
    reject(err);
  }
};

module.exports.handleV2 = function(response, resolve, reject) {
  if ( response.status === 200 || response.status === 201 ) {
    resolve(response.data);
  } else {
    reject(response.data);
  }
};

module.exports.errorV2 = function(err, reject) {
  if ( err.data ) {
    reject(err.data);
  } else {
    reject(err);
  }
};
