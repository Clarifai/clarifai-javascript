function errorHandler(err, done) {
  expect(err.status).toBe(true);
  expect(err.data).toBe(true);
  if (err.data) {
    log(err.data);
  } else {
    log(err);
  }
  done();
}

function log(obj) {
  try {
    console.log('[ERROR]', JSON.stringify(obj));
  } catch(e) {
    console.log(e);
  };
};

function pollStatus(fn) {
  var getStatus = setInterval(() => {
    fn(getStatus)
  }, 1000);
}

module.exports = {
  errorHandler,
  pollStatus
};