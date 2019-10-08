jasmine.DEFAULT_TIMEOUT_INTERVAL = 360000; // 6 minutes

function errorHandler(err) {
  console.log("Received an error response from the API:");
  if (err.response) {
    console.log(err.response.status + " " + err.response.statusText);

    try {
      console.log(JSON.stringify(err.response.data, null, 2));
    } catch (e) {
      console.log(err.response.data);
    }

    console.log("where the request was: " + err.response.config.method.toUpperCase() + " " + err.response.config.url);
    if (err.response.config.method.toUpperCase() !== "GET") {
      try {
        console.log(JSON.stringify(JSON.parse(err.response.config.data), null, 2));
      } catch (e) {
        console.log(err.response.config.data);
      }
    }
  } else {
    console.log(err);
  }

  this(err);
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
              waitForInputsUpload(app)
                .then(resolve)
                .catch(reject);
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
