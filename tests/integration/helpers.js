jasmine.DEFAULT_TIMEOUT_INTERVAL = 360000; // 6 minutes

function errorHandler(err) {
  if (err.data) {
    log(err.data);
  } else {
    log(err);
  }

  this(err);
}

function log(obj) {
  try {
    console.log('[ERROR]', JSON.stringify(obj));
  } catch (e) {
    console.log(e);
  }
}

function pollStatus(fn) {
  var getStatus = setInterval(() => {
    fn(getStatus);
  }, 1000);
}

function waitForInputsUpload(app) {
  return new Promise((resolve, reject) => {
    app.inputs.getStatus()
      .then(response => {
        if (response.counts.errors !== 0) {
          throw new Error('Error processing inputs', response);
        } else if (response.counts.to_process === 0) {
          resolve();
        } else {
          setTimeout(
            () => {
              waitForInputsUpload(resolve, reject);
            },
            1000
          );
        }
      })
      .catch(reject);
  });
}

module.exports = {
  errorHandler,
  pollStatus,
  waitForInputsUpload
};
