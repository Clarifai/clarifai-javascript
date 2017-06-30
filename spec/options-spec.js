const Clarifai = require('./../src');

describe('Options', () => {
  it('can initialize an app with just the options object', done => {
    const app = new Clarifai.App({clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET});
    expect(app._config.clientId).toEqual(process.env.CLIENT_ID);
    done();
  });
});
