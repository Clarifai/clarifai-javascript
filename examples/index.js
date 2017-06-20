const Clarifai = process.env.TRAVIS ? require('clarifai') : require('../src');

const clarifai = new Clarifai.App({
  apiKey: process.env.CLARIFAI_API_KEY
});

function log(d) {
  try {
    console.log(JSON.stringify(d, null, 2));
  }catch (e) {
    console.log(d);
  }
}

clarifai.models.predict(Clarifai.GENERAL_MODEL, 'https://samples.clarifai.com/3o6gb3kkXfLvdKEZs4.gif', {video: true})
  .then(log)
  .catch(log);
