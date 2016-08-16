fs = require('fs');
var Clarifai = require('./../index.js');
var imageBytes = require('./image-bytes');

var sampleImage = 'https://samples.clarifai.com/metro-north.jpg';
var sampleImage2 = 'https://samples.clarifai.com/wedding.jpg';
var sampleImage3 = 'https://samples.clarifai.com/cookies.jpeg';

describe('Clarifai JS SDK', function() {
  
  beforeAll(function() {
    Clarifai.initialize({
      'clientId': process.env.CLIENT_ID,
      'clientSecret': process.env.CLIENT_SECRET
    });
  });
  
  
  describe('Token', function() {
  
    it('Gets a token as a string', function(done) {
      Clarifai.getToken().then(
        function(response) {
          expect(response).toEqual(jasmine.any(String));
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Sets a token with an object', function(done) {
      var token = {
        'access_token': 'foo',
        'token_type': 'Bearer',
        'expires_in': 176400,
        'scope': 'api_access_write api_access api_access_read'
      };
      var tokenSet = Clarifai.setToken(token);
      Clarifai.getToken().then(
        function(response) {
          expect(tokenSet).toEqual(true);
          expect(response).toEqual(jasmine.any(String));
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Sets a token with a string', function(done) {
      var tokenSet = Clarifai.setToken('foo');
      Clarifai.getToken().then(
        function(response) {
          expect(tokenSet).toEqual(true);
          expect(response).toEqual(jasmine.any(String));
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Deletes a token', function() {
      Clarifai.deleteToken();
    });
    
  });
  

/*
  describe('Tag', function() {
  
    it('Gets tags for an image via url', function(done) {
      Clarifai.getTagsByUrl(sampleImage2).then(
        function(response) {
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(1);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Gets tags for multiple images via url', function(done) {
      Clarifai.getTagsByUrl([
        sampleImage2,
        sampleImage3
      ]).then(
        function(response) {
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(2);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Gets tags for an image via bytes', function(done) {
      Clarifai.getTagsByImageBytes(imageBytes).then(
        function(response) {
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(1);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Get tags for an image via url passing in a model', function(done) {
      Clarifai.getTagsByUrl(sampleImage2, {
        'model': 'nsfw-v0.1'
      }).then(
        function(response) {
          expect(response.meta.tag.model).toBe('nsfw-v0.1');
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(1);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Get tags for an image via url passing in a language', function(done) {
      Clarifai.getTagsByUrl(sampleImage2, {
        'language': 'es'
      }).then(
        function(response) {
          expect(response.results[0].result.tag.classes[0]).toBe('ceremonia');
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(1);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Get tags for an image via url and set a localId', function(done) {
      Clarifai.getTagsByUrl(sampleImage2, {
        'localId': 'myLocalId'
      }).then(
        function(response) {
          expect(response.results[0].local_id).toBe('myLocalId');
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(1);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Get tags for an image via url and restrict the tags returned', function(done) {
      Clarifai.getTagsByUrl(sampleImage2, {
        'selectClasses': ['people', 'wedding']
      }).then(
        function(response) {
          expect(response.results[0].result.tag.classes.length).toBe(2);
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(1);
          done();
        },
        errorHandler.bind(done)
      );
    });
    
  });
 
  describe('Info', function() {
  
    it('Gets info from the API', function(done) {
      Clarifai.getInfo().then(
        function(response) {
          expect(response.status_code).toBe('OK');
          expect(response.results.max_image_size).toBeDefined();
          expect(response.results.default_language).toBeDefined();
          expect(response.results.max_video_size).toBeDefined();
          expect(response.results.max_image_bytes).toBeDefined();
          expect(response.results.min_image_size).toBeDefined();
          expect(response.results.default_model).toBeDefined();
          expect(response.results.max_video_bytes).toBeDefined();
          expect(response.results.max_video_duration).toBeDefined();
          expect(response.results.max_batch_size).toBeDefined();
          expect(response.results.max_video_batch_size).toBeDefined();
          expect(response.results.min_video_size).toBeDefined();
          expect(response.results.api_version).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
  });
  
  describe('Usage', function() {
  
    it('Gets usage from the API', function(done) {
      Clarifai.getUsage().then(
        function(response) {
          expect(response.status_code).toBe('OK');
          expect(response.results.user_throttles).toBeDefined();
          expect(response.results.app_throttles).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
  });
  
  describe('Languages', function() {
  
    it('Gets languages from the API', function(done) {
      Clarifai.getLanguages().then(
        function(response) {
          expect(response.status_code).toBe('OK');
          expect(response.languages).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
  });
  
  describe('Color', function() {
  
    it('Gets color for an image via url', function(done) {
      Clarifai.getColorsByUrl(sampleImage2).then(
        function(response) {
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(1);
          expect(response.results[0].colors).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Gets color for multiple images via url', function(done) {
      Clarifai.getColorsByUrl([
        sampleImage2,
        sampleImage3
      ]).then(
        function(response) {
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(2);
          expect(response.results[0].colors).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Gets color for an image via bytes', function(done) {
      Clarifai.getColorsByImageBytes(imageBytes).then(
        function(response) {
          expect(response.status_msg).toBe('All images in request have completed successfully. ');
          expect(response.results.length).toBe(1);
          expect(response.results[0].colors).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
  });
  
  describe('Feedback', function() {
  
    it('Sends feedback to the API', function(done) {
      Clarifai.createFeedback(sampleImage, {
        'addTags': ['snow', 'evening',],
        'removeTags': ['road', 'business'],
      }).then(
        function(response) {
          expect(response.status_code).toBe('OK');
          expect(response.status_msg).toBe('Feedback successfully recorded. ');
          done();
        },
        errorHandler.bind(done)
      );
    });
    
  });
*/
  

  describe('Inputs', function() {
    var id = 'test-id' + Math.random();
    it('Adds an input', function(done) {
      Clarifai.addInputs([
        {
          "data": {
            "image": {
              "url": "https://samples.clarifai.com/metro-north.jpg"
            }
          },
          "id": id
        }
      ]).then(
        function(response) {
          expect(response.inputs).toBeDefined();
          var inputs = response.inputs;
          expect(inputs.length).toBe(1);
          expect(inputs[0].created_at).toBeDefined();
          expect(inputs[0].id).toBeDefined();
          expect(inputs[0].data).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    var id2 = 'test-id' + Math.random();
    it('Adds an input with tags', function(done) {
      Clarifai.addInputs([
        {
          "data": {
            "image": {
              "url": "https://samples.clarifai.com/metro-north.jpg"
            },
            "tags": [
              {
                "concept": {
                  "id": "train"
                },
                "value": true
              },
              {
                "concept": {
                  "id": "car"
                }, 
                "value": false
              }
            ]
          },
          "id": id2
        }
      ]).then(
        function(response) {
          expect(response.inputs).toBeDefined();
          var inputs = response.inputs;
          expect(inputs.length).toBe(1);
          expect(inputs[0].created_at).toBeDefined();
          expect(inputs[0].id).toBeDefined();
          expect(inputs[0].data).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    var id3 = 'test-id' + Math.random();
    var id4 = 'test-id' + Math.random();
    it('Bulk adds an input', function(done) {
      Clarifai.addInputs([
        {
          "data": { 
            "image": {
              "url": "https://samples.clarifai.com/metro-north.jpg"
            }
          },
          "id": id3
        },
        {
          "data": { 
            "image": {
              "url": "https://samples.clarifai.com/dog.tiff"
            }
          },
          "id": id4
        }
      ]).then(
        function(response) {
          expect(response.inputs).toBeDefined();
          var inputs = response.inputs;
          expect(inputs.length).toBe(2);
          expect(inputs[0].created_at).toBeDefined();
          expect(inputs[0].id).toBeDefined();
          expect(inputs[0].data).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    var id5 = 'test-id' + Math.random();
    var id6 = 'test-id' + Math.random();
    it('Bulk adds an input with tags', function(done) {
      Clarifai.addInputs([
        {
      "data": {
        "image": {
          "url": "http://i.imgur.com/HEoT5xR.png"
        },
        "tags": [
          {
            "concept": {
              "id": "ferrari"
            },
            "value": true
          },
          {
            "concept": {
              "id": "outdoors"
            }
          }
        ]
      },
      "id": id5
    },
    {
      "data": {
        "image": {
          "url": "http://i.imgur.com/It5JRaj.jpg"
        },
        "tags": [
          {
            "concept": {
              "id": "ferrari"
            },
            "value": true
          },
          {
            "concept": {
              "id": "outdoors"
            },
            "value": false
          }
        ]
      },
      "id": id6
    }
      ]).then(
        function(response) {
          expect(response.inputs).toBeDefined();
          var inputs = response.inputs;
          expect(inputs.length).toBe(2);
          expect(inputs[0].created_at).toBeDefined();
          expect(inputs[0].id).toBeDefined();
          expect(inputs[0].data).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Gets all inputs', function(done) {
      Clarifai.getInputs({
        'page': 1,
        'perPage': 5
      }).then(
        function(response) {
          expect(response.inputs).toBeDefined();
          var inputs = response.inputs;
          expect(inputs.length).toBeGreaterThan(0);
          expect(inputs.length).toBe(5);
          var input = inputs[0];
          expect(input.id).toBeDefined();
          expect(input.created_at).toBeDefined();
          expect(input.data).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Gets a single input by id', function(done) {
      Clarifai.getInputById(id).then(
        function(response) {
          expect(response.input).toBeDefined();
          expect(response.input.id).toBe(id);
          expect(response.input.created_at).toBeDefined();
          expect(response.input.data).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Gets inputs status', function(done) {
      Clarifai.getInputsStatus().then(
        function(response) {
          expect(response.counts).toBeDefined();
          var counts = response.counts;
          expect(counts.processed).toBeDefined();
          expect(counts.to_process).toBeDefined();
          expect(counts.errors).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Updates an input', function(done) {
      Clarifai.updateInputById(id, {
        "data": {
          "tags": [
            {
              "concept": {
                "id":"train"
              }, 
              "value": true
            },
            {
              "concept": {
                "id":"car"
              }, 
              "value": false
            }
          ]
        }
      }).then(
        function(response) {
          expect(response.input).toBeDefined();
          expect(response.input.created_at).toBeDefined();
          expect(response.input.id).toBeDefined();
          expect(response.input.data).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
  });

  
  describe('Models', function() {
    
     it('Creates a new model', function(done) {
      Clarifai.createModel({
        'name': 'test',
        'concepts': [
          {
            'id': 'ferrari'
          }
        ]
      }).then(
        function(response) {
          expect(response.model).toBeDefined();
          var model = response.model;
          expect(model.name).toBeDefined();
          expect(model.id).toBeDefined();
          expect(model.created_at).toBeDefined();
          expect(model.app).toBeDefined();
          expect(model.output_info).toBeDefined();
          expect(model.version).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    

    it('Creates a new model version', function(done) {
      Clarifai.createModelVersion('eb3b792155a4487b82ce575458ff2475').then(
        function(response) {
          expect(response.version).toBeDefined();
          var version = response.version;
          expect(version.status).toBeDefined();
          expect(version.created_at).toBeDefined();
          expect(version.version_id).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });
    
    it('Attatches model outputs', function(done) {
      Clarifai.attachModelOutputs('eb3b792155a4487b82ce575458ff2475', {
        'inputs': [
          {
            "data": {
              'image': {
                'url': 'http://www.ramtrucks.com/assets/towing_guide/images/before_you_buy/truck.png'
              }
            }
          },
          {
            "data": {
              'image': {
                'url': 'http://www.planwallpaper.com/static/images/ferrari-9.jpg'
              }
            }
          }
        ]
      }).then(
        function(response) {
          expect(response.outputs).toBeDefined();
          var outputs = response.outputs;
          expect(outputs.length).toBe(2);
          var output = outputs[0];
          expect(output.id).toBeDefined();
          expect(output.status).toBeDefined();
          expect(output.input).toBeDefined();
          expect(output.model).toBeDefined();
          expect(output.created_at).toBeDefined();
          expect(output.data).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });

     
  });
  
});

function responseHandler(response) {
  expect(true).toBe(true);
  this();
};

function errorHandler(err) {
  console.log(err);
  expect(err).toBe(true);
  this();
};

function log(obj) {
  console.log(JSON.stringify(obj, null, 2));
};

function testScoredImageResponse(response, done) {
  expect(response.scored_items).toBeDefined();
  var scoredItems = response.scored_items;
  expect(scoredItems.length).toBeGreaterThan(0);
  var scoredItem = scoredItems[0];
  expect(scoredItem.score).toBeDefined();
  expect(scoredItem.image).toBeDefined();
  expect(scoredItem.image.id).toBeDefined();
  expect(scoredItem.image.created_at).toBeDefined();
  expect(scoredItem.image.url).toBeDefined();
  done();
};
