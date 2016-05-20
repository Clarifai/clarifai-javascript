module.exports.handle = function(promise, callback) {
  if ( callback !== undefined &&  callback !== null ) {
    promise.then(
      function(data) {
        callback(null, data);
      },
      function(err) {
        callback(err, null);
      }
    );
  }
};