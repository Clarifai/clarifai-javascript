const axios = require('axios');
const Clarifai = require('./../src');
const {errorHandler} = require('./helpers');
const {sampleImages} = require('./test-data');
const LOGIN_URL = `${process.env.API_ENDPOINT || 'https://api.clarifai.com'}/v2/login`;
let sessionToken = null;

describe('Session Token', () => {
  beforeAll(done => {
    let data = JSON.stringify({
      email: process.env.USER_EMAIL,
      password: process.env.USER_PASSWORD
    });
    axios.post(LOGIN_URL, data)
      .then(results => {
        sessionToken = results.data.session_token;
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('can initialize an app with a session token, app id and user id', done => {
    const anApp = new Clarifai.App({
      sessionToken: sessionToken,
      appId: process.env.APP_ID,
      userId: process.env.USER_ID
    });
    expect(anApp._config.sessionToken).toEqual(sessionToken);
    done();
  });

  it('can make calls with a session token', done => {
    const anApp = new Clarifai.App({
      sessionToken: sessionToken,
      appId: process.env.APP_ID,
      userId: process.env.USER_ID
    });
    anApp.models.predict(Clarifai.GENERAL_MODEL, [
      {
        'url': sampleImages[0]
      },
      {
        'url': sampleImages[1]
      }
    ])
      .then(response => {
        expect(response.outputs).toBeDefined();
        const outputs = response.outputs;
        expect(outputs.length).toBe(2);
        const output = outputs[0];
        expect(output.id).toBeDefined();
        expect(output.status).toBeDefined();
        expect(output.input).toBeDefined();
        expect(output.model).toBeDefined();
        expect(output.created_at).toBeDefined();
        expect(output.data).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });

});
