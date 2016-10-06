var fs = require('fs');
var Clarifai = require('./../src/index');
var Models = require('./../src/Models');
var Inputs = require('./../src/Inputs');
var imageBytes = require('./image-bytes');

var sampleImage = 'https://samples.clarifai.com/metro-north.jpg';
var sampleImage2 = 'https://samples.clarifai.com/wedding.jpg';
var sampleImage3 = 'https://samples.clarifai.com/cookies.jpeg';
var app;

describe('Clarifai JS SDK', function() {
  beforeAll(function() {
    app = new Clarifai.App(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      {
        'apiEndpoint': process.env.API_ENDPOINT
      }
    );
  });

  describe('Token', function() {

    it('Gets a token as a string', function(done) {
      app._config.token().then(
        function(response) {
          expect(response['access_token']).toEqual(jasmine.any(String));
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
      var tokenSet = app.setToken(token);
      app._config.token().then(
          function(response) {
            expect(tokenSet).toEqual(true);
            expect(response['access_token']).toEqual(jasmine.any(String));
            done();
          },
          errorHandler.bind(done)
        );
      });

    it('Sets a token with a string', function(done) {
      var tokenSet = app.setToken('foo');
      app._config.token().then(
        function(response) {
          expect(tokenSet).toEqual(true);
          expect(response['access_token']).toEqual(jasmine.any(String));
          done();
        },
        errorHandler.bind(done)
      );
    });
  });

  describe('Inputs', function() {
      var inputId;
      it('Adds an input', function(done) {
        app.inputs.create([
          {
            url: "https://samples.clarifai.com/metro-north.jpg",
            allowDuplicateUrl: true
          }
        ]).then(
          function(inputs) {
            expect(inputs).toBeDefined();
            expect(inputs instanceof Inputs).toBe(true);
            expect(inputs.length).toBe(1);
            expect(inputs[0].createdAt).toBeDefined();
            expect(inputs[0].id).toBeDefined();
            inputId = inputs[0].id;
            expect(inputs[0].toObject().data).toBeDefined();
            done();
          },
          errorHandler.bind(done)
        );
      });

      it('Adds an input with tags', function(done) {
        app.inputs.create([
          {
            url: "https://samples.clarifai.com/metro-north.jpg",
            allowDuplicateUrl: true,
            concepts: [
              {
                id: "train",
                value: true
              },
              {
                id: "car",
                value: false
              }
            ]
          }
        ]).then(
          function(inputs) {
            expect(inputs).toBeDefined();
            expect(inputs instanceof Inputs).toBe(true);
            expect(inputs.length).toBe(1);
            expect(inputs[0].createdAt).toBeDefined();
            expect(inputs[0].id).toBeDefined();
            expect(inputs[0].toObject().data).toBeDefined();
            done();
          },
          errorHandler.bind(done)
        );
      });

      it('Bulk adds inputs', function(done) {
        app.inputs.create([
          {
            url: "https://samples.clarifai.com/metro-north.jpg",
            allowDuplicateUrl: true
          },
          {
            url: "https://samples.clarifai.com/dog.tiff",
            allowDuplicateUrl: true
          }
        ]).then(
          function(inputs) {
            expect(inputs).toBeDefined();
            expect(inputs instanceof Inputs).toBe(true);
            expect(inputs.length).toBe(2);
            expect(inputs[0].createdAt).toBeDefined();
            expect(inputs[0].id).toBeDefined();
            expect(inputs[0].toObject().data).toBeDefined();
            done();
          },
          errorHandler.bind(done)
        );
      });

      it('Bulk adds inputs with tags', function(done) {
        app.inputs.create([
          {
            url: "http://i.imgur.com/HEoT5xR.png",
            allowDuplicateUrl: true,
            concepts: [
              {
                id: "ferrari",
                value: true
              },
              {
                id: "outdoors"
              }
            ]
          },
          {
            url: "http://i.imgur.com/It5JRaj.jpg",
            allowDuplicateUrl: true,
            concepts: [
              {
                id: "ferrari",
                value: true
              },
              {
                id: "outdoors",
                value: false
              }
            ]
          }
        ]).then(
          function(inputs) {
            expect(inputs).toBeDefined();
            expect(inputs instanceof Inputs).toBe(true);
            expect(inputs.length).toBe(2);
            expect(inputs[0].createdAt).toBeDefined();
            expect(inputs[0].id).toBeDefined();
            expect(inputs[0].toObject().data).toBeDefined();
            done();
          },
          errorHandler.bind(done)
        );
      });

      it('Gets all inputs', function(done) {
        app.inputs.list({
        'page': 1,
        'perPage': 5
        }).then(
          function(inputs) {
            expect(inputs).toBeDefined();
            expect(inputs instanceof Inputs).toBe(true);
            expect(inputs.length).toBe(5);
            var input = inputs[0];
            expect(input.id).toBeDefined();
            expect(input.createdAt).toBeDefined();
            expect(input.toObject().data).toBeDefined();
            done();
          },
          errorHandler.bind(done)
        );
      });

      it('Gets a single input by id', function(done) {
        app.inputs.get(inputId).then(
          function(input) {
            expect(input).toBeDefined();
            expect(input.id).toBe(inputId);
            expect(input.createdAt).toBeDefined();
            expect(input.toObject().data).toBeDefined();
            done();
          },
          errorHandler.bind(done)
        );
      });

      it('Gets inputs status', function(done) {
        app.inputs.getStatus().then(
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
        app.inputs.mergeConcepts([
          {
            id: inputId,
            concepts: [
              { "id":"train", "value": true },
              { "id":"car", "value": false }
            ]
          }
        ]).then(
          function(inputs) {
            expect(inputs).toBeDefined();
            expect(inputs.length).toBe(1);
            expect(inputs instanceof Inputs).toBe(true);
            expect(inputs[0].createdAt).toBeDefined();
            expect(inputs[0].id).toBeDefined();
            expect(inputs[0].toObject().data).toBeDefined();
            done();
          },
          errorHandler.bind(done)
        );
      });
  });


  describe('Models', function() {
    var testModel;
    var generalModel;
    var generalModelId;

    it('Creates a new model', function(done) {
      app.models.create('vroom-vroom', [
        {
          'id': 'ferrari'
        }
      ]).then(
        function(model) {
          expect(model).toBeDefined();
          expect(model.name).toBeDefined();
          expect(model.id).toBeDefined();
          testModel = model;
          expect(model.createdAt).toBeDefined();
          expect(model.appId).toBeDefined();
          expect(model.outputInfo).toBeDefined();
          expect(model.modelVersion).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });


    it('Creates a new model version', function(done) {
      testModel.train().then(
        function(model) {
          expect(model).toBeDefined();
          expect(model.modelVersion).toBeDefined();
          expect(model.toObject()).toBeDefined();
          var version = model.modelVersion;
          expect(version.id).toBeDefined();
          expect(version.created_at).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Creates a new model version and returns after it has finished', function(done) {
      testModel.train(true).then(
        function(model) {
          expect(model).toBeDefined();
          expect(model.modelVersion).toBeDefined();
          expect(model.toObject()).toBeDefined();
          var version = model.modelVersion;
          expect(version.id).toBeDefined();
          expect(version.created_at).toBeDefined();
          expect(version.status.code).toBe(21100);
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Searches for a model', function(done) {
      app.models.search('vroom-vroom').then(
        function(models) {
          expect(models).toBeDefined();
          var model = models[0];
          expect(model).toBeDefined();
          expect(model.name).toBe('vroom-vroom');
          expect(model.id).toBeDefined();
          generalModelId = model.id;
          generalModel = model;
          expect(model.createdAt).toBeDefined();
          expect(model.appId).toBeDefined();
          expect(model.outputInfo).toBeDefined();
          expect(model.modelVersion).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Call predict on models collection giving a model id', function(done) {
      app.models.predict(generalModelId, [
        {
          'url': 'http://www.ramtrucks.com/assets/towing_guide/images/before_you_buy/truck.png'
        },
        {
          'url': 'http://www.planwallpaper.com/static/images/ferrari-9.jpg'
        }
      ]).then(
        function(response) {
          expect(response.data.outputs).toBeDefined();
          var outputs = response.data.outputs;
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

    it('Attaches model outputs', function(done) {
      generalModel.predict([
        {
          'url': 'http://www.ramtrucks.com/assets/towing_guide/images/before_you_buy/truck.png'
        },
        {
          'url': 'http://www.planwallpaper.com/static/images/ferrari-9.jpg'
        }
      ]).then(
        function(response) {
          expect(response.data.outputs).toBeDefined();
          var outputs = response.data.outputs;
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


  describe('Search', function() {
    it('Filter by images/inputs only', function(done) {
      app.inputs.search([
        {
          'url': 'https://samples.clarifai.com/metro-north.jpg'
        }
      ]).then(
        function(inputs) {
          expect(inputs instanceof Inputs).toBe(true);
          expect(inputs[0].score).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Filter by concepts/inputs only', function(done) {
      app.inputs.search([
        {
          'url': 'https://samples.clarifai.com/metro-north.jpg'
        },
        {
          "url": "https://samples.clarifai.com/dog.tiff",
        }
      ]).then(
        function(inputs) {
          expect(inputs instanceof Inputs).toBe(true);
          expect(inputs[0].score).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Filter by images and concepts', function(done) {
      var val = app.inputs.search([
        {
          'url': 'https://samples.clarifai.com/metro-north.jpg'
        },
        {
          'name': 'ferrari'
        }
      ]);
      val.then(
        function(inputs) {
          expect(inputs instanceof Inputs).toBe(true);
          expect(inputs[0].score).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      )
    });
  });
});

function responseHandler(response) {
  expect(true).toBe(true);
  this();
};

function errorHandler(err) {
  expect(err.status).toBe(true);
  expect(err.data).toBe(true);
  this();
};

function log(obj) {
  console.log(JSON.stringify(obj, null, 2));
};
