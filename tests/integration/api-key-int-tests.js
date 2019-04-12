const Clarifai = require('./../../src');
const {errorHandler} = require('./helpers');
const {sampleImages} = require('./test-data');

describe('Integration Tests - API key', () => {
  it('can initialize an app with an api key', done => {
    expect(process.env.CLARIFAI_API_KEY).toBeDefined();
    const anApp = new Clarifai.App({apiKey: process.env.CLARIFAI_API_KEY});
    expect(anApp._config.apiKey).toEqual(process.env.CLARIFAI_API_KEY);
    done();
  });

  it('can make calls with an api key', done => {
    const anApp = new Clarifai.App({apiKey: process.env.CLARIFAI_API_KEY});
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
