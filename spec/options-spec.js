const Clarifai = require('./../src');

describe('Options', () => {
  it('can initialize an app with just the options object', done => {
    // Skip test if these aren't defined
    if (
      !process.env.CLIENT_ID ||
      !process.env.CLIENT_SECRET
    ) {
      return pending('CLIENT_ID or CLIENT_SECRET not defined');
    }

    const app = new Clarifai.App({clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET});
    expect(app._config.clientId).toEqual(process.env.CLIENT_ID);
    done();
  });
});
