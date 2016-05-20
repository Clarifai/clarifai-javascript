var Clarifai = require('./../index.js');

Clarifai.initialize({
  'clientId': process.env.CLIENT_ID,
  'clientSecret': process.env.CLIENT_SECRET
});

// get a token
function getToken() {
  Clarifai.getToken().then(
    handleResponse,
    handleError
  );
};

// get tags with an array of images
function getTags() {
  Clarifai.getTagsByUrl([
    'https://samples.clarifai.com/wedding.jpg',
    'https://samples.clarifai.com/cookies.jpeg'
  ]).then(
    handleResponse,
    handleError
  );
};

// select which tags are returned
function selectClasses() {
  Clarifai.getTagsByUrl(
    'https://samples.clarifai.com/wedding.jpg',
    {
      'selectClasses': ['people', 'dress', 'wedding']
    }
  ).then(
    handleResponse,
    handleError
  );
};

// get api info
function getInfo() {
  Clarifai.getInfo().then(
    handleResponse,
    handleError
  );
};

// get languages
function getLanguages() {
  Clarifai.getLanguages().then(
    handleResponse,
    handleError
  );
};

// get colors
function getColors() {
  Clarifai.getColorsByUrl('https://samples.clarifai.com/wedding.jpg').then(
    handleResponse,
    handleError
  );
};

// get api usage
function getUsage() {
  Clarifai.getUsage().then(
    handleResponse,
    handleError
  );
};

// create feedback
function createFeedback() {
  Clarifai.createFeedback('https://samples.clarifai.com/wedding.jpg', {
    'addTags': ['family', 'friends',],
    'removeTags': ['military', 'protest'],
  }).then(
    handleResponse,
    handleError
  );
};

function handleResponse(response){
  console.log('promise response:', JSON.stringify(response));
};

function handleError(err){
  console.log('promise error:', err);
};


getTags();
selectClasses();
getColors();
getUsage();
getLanguages();
getInfo();
createFeedback();

