fs = require('fs');
var Clarifai = require('./../index.js');
var imageBytes = require('./image-bytes');

var sampleImage = 'https://samples.clarifai.com/metro-north.jpg';
var sampleImage2 = 'https://samples.clarifai.com/wedding.jpg';
var sampleImage3 = 'https://samples.clarifai.com/cookies.jpeg';


function generateRandomId() {
  return Math.floor(Math.random() * 1000000);
}

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

  describe('Inputs', function() {
      var id = 'test-id' + generateRandomId();
      it('Adds an input', function(done) {
        Clarifai.addInputs([
          {
            "url": "https://samples.clarifai.com/metro-north.jpg",
            "inputId": id
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

      var id2 = 'test-id' + generateRandomId();
      it('Adds an input with tags', function(done) {
        Clarifai.addInputs([
          {
            "url": "https://samples.clarifai.com/metro-north.jpg",
            "inputId": id2,
            "concepts": [
              {
                "id": "train",
                "value": true
              },
              {
                "id": "car",
                "value": false
              }
            ]
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

      var id3 = 'test-id' + generateRandomId();
      var id4 = 'test-id' + generateRandomId();
      it('Bulk adds inputs', function(done) {
        Clarifai.addInputs([
          {
            "url": "https://samples.clarifai.com/metro-north.jpg",
            "id": id3
          },
          {
            "url": "https://samples.clarifai.com/dog.tiff",
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

      var id5 = 'test-id' + generateRandomId();
      var id6 = 'test-id' + generateRandomId();
      it('Bulk adds inputs with tags', function(done) {
        Clarifai.addInputs([
          {
            "url": "http://i.imgur.com/HEoT5xR.png",
            "id": id5,
            "concepts": [
              {
                "id": "ferrari",
                "value": true
              },
              {
                "id": "outdoors"
              }
            ]
          },
          {
            "url": "http://i.imgur.com/It5JRaj.jpg",
            "id": id6,
            "concepts": [
              {
                "id": "ferrari",
                "value": true
              },
              {
                "id": "outdoors",
                "value": false
              }
            ]
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
        Clarifai.updateInput(id, [
          {
            "id":"train",
            "value": true
          },
          {
            "id":"car",
            "value": false
          }
        ], 'merge_concepts').then(
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
    var modelId;

    it('Creates a new model', function(done) {
      Clarifai.createModel('vroom-vroom', [
        {
          'id': 'ferrari'
        }
      ]).then(
        function(response) {
          expect(response.model).toBeDefined();
          var model = response.model;
          expect(model.name).toBeDefined();
          expect(model.id).toBeDefined();
          modelId = model.id;
          expect(model.created_at).toBeDefined();
          expect(model.app_id).toBeDefined();
          expect(model.output_info).toBeDefined();
          expect(model.model_version).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });


    it('Creates a new model version', function(done) {
      Clarifai.createModelVersion(modelId).then(
        function(response) {
          expect(response.model).toBeDefined();
          expect(response.model.model_version).toBeDefined();
          var version = response.model.model_version;
          expect(version.id).toBeDefined();
          expect(version.created_at).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Attaches model outputs', function(done) {
      Clarifai.createOutputs(modelId, [
        {
          'url': 'http://www.ramtrucks.com/assets/towing_guide/images/before_you_buy/truck.png'
        },
        {
          'url': 'http://www.planwallpaper.com/static/images/ferrari-9.jpg'
        }
      ]).then(
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
