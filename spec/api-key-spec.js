const Clarifai = require('./../src');
const {errorHandler} = require('./helpers');
const {sampleImages} = require('./test-data');

describe('API key', () => {
  it('can initialize an app with an api key', done => {
    const anApp = new Clarifai.App({apiKey: process.env.API_KEY});
    expect(anApp._config.apiKey).toEqual(process.env.API_KEY);
    done();
  });

  it('can make calls with an api key', done => {
    const anApp = new Clarifai.App({apiKey: process.env.API_KEY});
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

  it('Sets a token with an object', done => {
    const token = {
      access_token: 'foo',
      token_type: 'Bearer',
      expires_in: 100000,
      scope: 'api_access_write api_access api_access_read'
    };
    const anApp = new Clarifai.App(null, null, {token: token});
    anApp._config.token()
      .then(response => {
        expect(response.accessToken).toEqual('foo');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Sets a token with a string', done => {
    const anApp = new Clarifai.App(null, null, {token: 'bar'});
    anApp._config.token()
      .then(response => {
        expect(response.accessToken).toEqual('bar');
        done();
      })
      .catch(errorHandler.bind(done));
  });
});
