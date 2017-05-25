const Clarifai = require('../src');

const clarifai = new Clarifai.App({
  apiKey: process.env.CLARIFAI_API_KEY
});

const log = console.log.bind(console);

clarifai.models.predict(Clarifai.GENERAL_MODEL, 'https://samples.clarifai.com/3o6gb3kkXfLvdKEZs4.gif', true)
  .then(log)
  .catch(log);
