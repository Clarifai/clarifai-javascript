var fs = require('fs');
var Clarifai = require('./../src/index');
var Models = require('./../src/Models');
var Inputs = require('./../src/Inputs');
var imageBytes = require('./image-bytes');

var sampleImage = 'https://samples.clarifai.com/metro-north.jpg';
var sampleImage2 = 'https://samples.clarifai.com/wedding.jpg';
var sampleImage3 = 'https://samples.clarifai.com/cookies.jpeg';
var inputsIDs = [];
var conceptsIds;
var app;
var beerId = 'beer' + Date.now();
var ferrariId = 'ferrari' + Date.now();
var d = Date.now();
var inputId1 = 'foobar' + d;
var inputId2 = 'foobaz' + d;

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

  describe('Concepts', function() {
    conceptsIds = [
      'porsche' + Date.now(),
      'rolls royce' + Date.now(),
      'lamborghini' + Date.now(),
      beerId,
      ferrariId
    ];

    it('creates concepts given a list of strings', function(done) {
      app.concepts.create(conceptsIds).then(
        function(concepts) {
          expect(concepts).toBeDefined();
          expect(concepts.length).toBe(conceptsIds.length);
          expect(concepts[0].id).toBe(conceptsIds[0]);
          expect(concepts[1].id).toBe(conceptsIds[1]);
          expect(concepts[2].id).toBe(conceptsIds[2]);
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

      it('Adds an input with concepts', function(done) {
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

      it('Adds input with metadata', function(done) {
        app.inputs.create([
          {
            id: inputId1,
            url: "https://s3.amazonaws.com/samples.clarifai.com/beer.jpeg",
            allowDuplicateUrl: true,
            concepts: [{ id: beerId }],
            metadata: { foo: 'bar', baz: 'blah' }
          },
          {
            id: inputId2,
            url: "https://s3.amazonaws.com/samples.clarifai.com/beer.jpeg",
            allowDuplicateUrl: true,
            concepts: [{ id: beerId }],
            metadata: { foo: 'baz', baz: 'blah' }
          }
        ]).then(
          function(inputs) {
            expect(inputs).toBeDefined();
            expect(inputs instanceof Inputs).toBe(true);
            expect(inputs.length).toBe(2);
            expect(inputs[0].id).toBe(inputId1);
            expect(inputs[1].id).toBe(inputId2);
            expect(inputs[0].toObject().data.metadata.foo).toBe('bar');
            expect(inputs[1].toObject().data.metadata.foo).toBe('baz');
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

      it('Bulk adds inputs with concepts', function(done) {
        app.inputs.create([
          {
            url: "http://i.imgur.com/HEoT5xR.png",
            allowDuplicateUrl: true,
            concepts: [
              {
                id: ferrariId
              },
              {
                id: "outdoors",
                value: false
              }
            ]
          },
          {
            url: "http://i.imgur.com/It5JRaj.jpg",
            allowDuplicateUrl: true,
            concepts: [
              {
                id: ferrariId
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
            inputs.rawData.forEach(function(input) {
              inputsIDs.push(input.id);
            });
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
    var testModelId = 'vroom-vroom' + Date.now();

    it('Creates a new model', function(done) {
      app.models.create(testModelId, [
        {
          'id': ferrariId
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

    it('Throws an error if no model id is given', function(done) {
      expect(function(){
        app.models.create({name: 'asdf'}, [{'id': ferrariId}]);
      }).toThrow(new Error('Model ID is required'));
      done();
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
      app.models.search(testModelId).then(
        function(models) {
          expect(models).toBeDefined();
          var model = models[0];
          expect(model).toBeDefined();
          expect(model.name).toBe(testModelId);
          expect(model.id).toBeDefined();
          expect(model.createdAt).toBeDefined();
          expect(model.appId).toBeDefined();
          expect(model.outputInfo).toBeDefined();
          expect(model.modelVersion).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Call predict on models collection given a model id', function(done) {
      app.models.predict(Clarifai.GENERAL_MODEL, [
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
      app.models.initModel(Clarifai.GENERAL_MODEL).then(function(generalModel) {
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
        )
      });
    });

    it('Update model name and config', function(done) {
      app.models.update({
        id: testModel.id,
        name: 'Super Cars',
        conceptsMutuallyExclusive: true,
        closedEnvironment: true
      }).then(
        function(models) {
          expect(models).toBeDefined();
          expect(models[0]).toBeDefined();
          expect(models[0].id).toBe(testModel.id);
          expect(models[0].name).toBe('Super Cars');
          expect(models[0].outputInfo.output_config.concepts_mutually_exclusive).toBe(true);
          expect(models[0].outputInfo.output_config.closed_environment).toBe(true);
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Update model concepts', function(done) {
      app.models.update({
        id: testModel.id,
        concepts: conceptsIds
      }).then(
        function(models) {
          models[0].getOutputInfo().then(
            function(model) {
              expect(model.outputInfo).toBeDefined();
              expect(model.outputInfo.data.concepts).toBeDefined();
              expect(model.outputInfo.data.concepts.length).toBe(conceptsIds.length);
              expect(model.outputInfo.data.concepts[0].id).toBe(conceptsIds[0]);
              expect(model.outputInfo.data.concepts[1].id).toBe(conceptsIds[1]);
              expect(model.outputInfo.data.concepts[2].id).toBe(conceptsIds[2]);
              done();
            },
            errorHandler.bind(done)
          );
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
      app.inputs.search([
        {
          'url': 'https://samples.clarifai.com/metro-north.jpg'
        },
        {
          'name': ferrariId
        }
      ]).then(
        function(inputs) {
          expect(inputs instanceof Inputs).toBe(true);
          expect(inputs[0].score).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      )
    });

    it('Filter with metadata only', function(done) {
      app.inputs.search([{
        'metadata': {
          'baz': 'blah'
        }
      }]).then(
        function(inputs) {
          expect(inputs instanceof Inputs).toBe(true);
          expect(inputs.length).toBe(2);
          done();
        },
        errorHandler.bind(done)
      )
    });

    it('Filter with metadata and image url', function(done) {
      app.inputs.search([
        {
          'url': "https://s3.amazonaws.com/samples.clarifai.com/beer.jpeg",
          'metadata': {
            'foo': 'bar'
          }
        }
      ]).then(
        function(inputs) {
          expect(inputs instanceof Inputs).toBe(true);
          expect(inputs[0].score).toBeDefined();
          expect(inputs[0].id).toBe(inputId1);
          done();
        },
        errorHandler.bind(done)
      )
    });
  });

  describe('Delete Resources', function() {
    it('Allows you to delete inputs partially', function(done) {
      app.inputs.delete(inputsIDs.slice(0, 1)).then(
        function(response) {
          var data = response.data;
          expect(data.status).toBeDefined();
          expect(data.status.code).toBe(10000);
          expect(data.status.description).toBe('Ok');
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Allows you to delete all inputs', function(done) {
      app.inputs.delete().then(
        function(response) {
          var data = response.data;
          expect(data.status).toBeDefined();
          expect(data.status.code).toBe(10000);
          expect(data.status.description).toBe('Ok');
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
  expect(err.status).toBe(true);
  expect(err.data).toBe(true);
  this();
};

function log(obj) {
  console.log(JSON.stringify(obj, null, 2));
};
