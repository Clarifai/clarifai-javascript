const Clarifai = require('./../src');
const {errorHandler} = require('./helpers');
const {sampleImages} = require('./test-data');

describe('Session Token', () => {

  it('can initialize an app with a session token, app id and user id', done => {
    const anApp = new Clarifai.App({
      sessionToken: process.env.SESSION_TOKEN,
      appId: process.env.APP_ID,
      userId: process.env.USER_ID
    });
    expect(anApp._config.sessionToken).toEqual(process.env.SESSION_TOKEN);
    done();
  });

  it('can make calls with a session token', done => {
    const anApp = new Clarifai.App({
      sessionToken: process.env.SESSION_TOKEN,
      appId: process.env.CLARIFAI_USER_APP_ID,
      userId: process.env.USER_ID,
      apiEndpoint: process.env.API_ENDPOINT
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
