const Clarifai = process.env.TRAVIS ? require('clarifai') : require('../src');

const clarifai = new Clarifai.App({
  apiKey: process.env.CLARIFAI_API_KEY
});

function log(d) {
  try {
    console.log(JSON.stringify(d, null, 2));
  } catch (e) {
    console.log(d);
  }
}

// Prediction on general model using video API
clarifai.models.predict(Clarifai.GENERAL_MODEL, 'https://samples.clarifai.com/3o6gb3kkXfLvdKEZs4.gif', {video: true})
  .then(log)
  .catch(log);


// Provide feedback
clarifai.models.feedback(Clarifai.GENERAL_MODEL, 'https://s3.amazonaws.com/samples.clarifai.com/metro-north.jpg', {
  id: 'ea68cac87c304b28a8046557062f34a0',
  data: {
    concepts: [
      {'id': 'train', 'value': true},
      {'id': 'car', 'value': false}
    ]
  },
  info: {
    'endUserId': '{end_user_id}',
    'sessionId': '{{session_id}}',
    'outputId': '{{output_id}}'
  }
})
  .then(log)
  .catch(log);