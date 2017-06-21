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

// clarifai.models.predict(Clarifai.GENERAL_MODEL, 'https://samples.clarifai.com/3o6gb3kkXfLvdKEZs4.gif', {video: true})
//   .then(log)
//   .catch(log);


clarifai.models.feedback(Clarifai.GENERAL_MODEL, 'https://s3.amazonaws.com/samples.clarifai.com/metro-north.jpg', {
  id: 'xyz',
  data: {
    concepts: [
      {'id': 'mattid2', 'value': true},
      {'id': 'lambo', 'value': false}
    ]
  },
  info: {
    'end_user_id': 'xyz123',
    'session_id': 'tdrfsf',
    'event_type': 'annotation',
    'output_id': '{{output_id}}'
  }
})
  .then(log)
  .catch(log);

const a = {
  'input': {
    'id': 'xyz',
    'data': {
      'image': {
        'url': ''
      },
      'concepts': [
        {'id': 'mattid2', 'value': true},
        {'id': 'lambo', 'value': false}
      ]
    },
    'feedback_info': {
      'end_user_id': 'xyz123',
      'session_id': '',
      'event_type': 'annotation',
      'output_id': '{{output_id}}'
    }
  }
};