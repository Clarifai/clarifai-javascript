var fs = require('fs');
var Clarifai = require('./../src/index');
var Models = require('./../src/Models');
var Model = require('./../src/Model');
var Inputs = require('./../src/Inputs');

var sampleImage1 = 'https://s3.amazonaws.com/samples.clarifai.com/metro-north.jpg';
var sampleImage2 = 'https://s3.amazonaws.com/samples.clarifai.com/wedding.jpg';
var sampleImage3 = 'https://s3.amazonaws.com/samples.clarifai.com/cookies.jpeg';
var sampleImage4 = 'https://s3.amazonaws.com/samples.clarifai.com/beer.jpeg';
var sampleImage5 = 'https://s3.amazonaws.com/samples.clarifai.com/dog.tiff';
var sampleImage6 = 'https://s3.amazonaws.com/samples.clarifai.com/red-car-1.png';
var sampleImage7 = 'https://s3.amazonaws.com/samples.clarifai.com/red-car-2.jpeg';
var sampleImage8 = 'https://s3.amazonaws.com/samples.clarifai.com/red-truck.png';
var sampleImage9 = 'https://s3.amazonaws.com/samples.clarifai.com/black-car.jpg';
var sampleVideo1 = 'https://samples.clarifai.com/3o6gb3kkXfLvdKEZs4.gif';
var lastCount;
var inputsIDs = [];
var conceptsIds;
var conceptsCount = 0;
var langConceptId = '的な' + Date.now();
var app;
var app3;
var beerId = 'beer' + Date.now();
var ferrariId = 'ferrari' + Date.now();
var d = Date.now();
var inputId1 = 'foobar' + d;
var inputId2 = 'foobaz' + d;
var inputId3 = 'input-with-geodata-1';
var inputId4 = 'input-with-geodata-2';
var inputId5 = 'input-with-geodata-3';
var testModelId;
var testModelVersionId;
var testWorkflowId;
var generalModelVersionId = 'aa9ca48295b37401f8af92ad1af0d91d';

describe('Clarifai JS SDK', function() {
  beforeAll(function() {
    app = new Clarifai.App(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      {
        apiEndpoint: process.env.API_ENDPOINT,
        token: process.env.CLIENT_TOKEN
      }
    );
  });
  describe('Options', function() {
    it('can initialize an app with just the options object', function(done) {
      var app2 = new Clarifai.App({clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET});
      expect(app2._config.clientId).toEqual(process.env.CLIENT_ID);
      done();
    });
  });
  describe('API key', function() {
    it('can initialize an app with an api key', function(done) {
      app3 = new Clarifai.App({apiKey: process.env.API_KEY});
      expect(app3._config.apiKey).toEqual(process.env.API_KEY);
      done();
    });
    it('can make calls with an api key', function(done) {
      app3.models.predict(Clarifai.GENERAL_MODEL, [
        {
          'url': sampleImage8
        },
        {
          'url': sampleImage9
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
    it('Sets a token with an object', function(done) {
      var token = {
        access_token: 'foo',
        token_type: 'Bearer',
        expires_in: 100000,
        scope: 'api_access_write api_access api_access_read'
      };
      var app2 = new Clarifai.App(null, null, {token: token});
      app2._config.token().then(
        function(response) {
          expect(response.accessToken).toEqual('foo');
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Sets a token with a string', function(done) {
      var app3 = new Clarifai.App(null, null, {token: 'bar'});
      app3._config.token().then(
        function(response) {
          expect(response.accessToken).toEqual('bar');
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
      langConceptId,
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

    it('gets concept with id in a different language', function(done) {
      app.concepts.get(langConceptId).then(
        function(concept) {
          expect(concept.id).toBe(langConceptId);
          expect(concept.name).toBe(langConceptId);
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('search concepts', function(done) {
      app.concepts.search('lab*').then(
        function(concepts) {
          expect(concepts.length).toBe(6);
          expect(concepts[0].name).toBe('label');
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('search concepts in a different language', function(done) {
      app.concepts.search('狗*', 'zh').then(
        function(concepts) {
          expect(concepts.length).toBe(3);
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
          url: sampleImage1,
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
          expect(inputs[0].rawData).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Adds an input with concepts', function(done) {
      app.inputs.create([
        {
          url: sampleImage1,
          allowDuplicateUrl: true,
          concepts: [
            {
              id: 'train',
              value: true
            },
            {
              id: 'car',
              value: false
            },
            {
              id: '的な'
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
          expect(inputs[0].rawData).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Adds input with metadata', function(done) {
      app.inputs.create([
        {
          id: inputId1,
          url: sampleImage4,
          allowDuplicateUrl: true,
          concepts: [{id: beerId}],
          metadata: {foo: 'bar', baz: 'blah'}
        },
        {
          id: inputId2,
          url: sampleImage4,
          allowDuplicateUrl: true,
          concepts: [{id: beerId}],
          metadata: {foo: 'baz', baz: 'blah'}
        }
      ]).then(
        function(inputs) {
          expect(inputs).toBeDefined();
          expect(inputs instanceof Inputs).toBe(true);
          expect(inputs.length).toBe(2);
          expect(inputs[0].id).toBe(inputId1);
          expect(inputs[1].id).toBe(inputId2);
          expect(inputs[0].rawData.data.metadata.foo).toBe('bar');
          expect(inputs[1].rawData.data.metadata.foo).toBe('baz');
          pollStatus(function(interval) {
            app.inputs.getStatus().then(
              function(data) {
                if (data['counts']['to_process'] == 0) {
                  clearInterval(interval);
                  if (data['errors'] > 0) {
                    throw new Error('Error processing inputs', data);
                  } else {
                    done();
                  }
                }
              },
              errorHandler.bind(done)
            );
          });
        },
        errorHandler.bind(done)
      );
    });

    it('Adds input with geodata', function(done) {
      app.inputs.create([
        {
          id: inputId3,
          url: sampleImage1,
          allowDuplicateUrl: true,
          concepts: [{id: beerId}],
          geo: {longitude: -30, latitude: 40}
        },
        {
          id: inputId4,
          url: sampleImage2,
          allowDuplicateUrl: true,
          concepts: [{id: beerId}],
          geo: {longitude: -20, latitude: 42.05},
          metadata: {test: [1, 2, 3, 4]}
        },
        {
          id: inputId5,
          url: sampleImage3,
          allowDuplicateUrl: true,
          concepts: [{id: beerId}],
          geo: {longitude: -20, latitude: 42.05},
          metadata: {test: [1, 2, 3, 4]}
        }
      ]).then(
        function(inputs) {
          expect(inputs).toBeDefined();
          expect(inputs instanceof Inputs).toBe(true);
          expect(inputs.length).toBe(3);
          expect(inputs[0].id).toBe(inputId3);
          expect(inputs[1].id).toBe(inputId4);
          expect(inputs[0].geo.geoPoint.latitude).toBe(40);
          expect(inputs[0].geo.geoPoint.longitude).toBe(-30);
          expect(inputs[1].geo.geoPoint.latitude).toBe(42.05);
          expect(inputs[1].geo.geoPoint.longitude).toBe(-20);
          expect(inputs[1].rawData.data.metadata.test).toBeDefined();
          expect(inputs[1].rawData.data.metadata.test[0]).toBe(1);
          expect(inputs[1].rawData.data.metadata.test[1]).toBe(2);
          expect(inputs[1].metadata.test).toBeDefined();
          expect(inputs[1].metadata.test[2]).toBe(3);
          expect(inputs[1].metadata.test[3]).toBe(4);
          pollStatus(function(interval) {
            app.inputs.getStatus().then(
              function(data) {
                if (data['counts']['to_process'] == 0) {
                  clearInterval(interval);
                  if (data['errors'] > 0) {
                    throw new Error('Error processing inputs', data);
                  } else {
                    done();
                  }
                }
              },
              errorHandler.bind(done)
            );
          });
        },
        errorHandler.bind(done)
      );
    });

    it('Bulk adds inputs', function(done) {
      app.inputs.create([
        {
          url: sampleImage1,
          allowDuplicateUrl: true
        },
        {
          url: sampleImage5,
          allowDuplicateUrl: true
        }
      ]).then(
        function(inputs) {
          expect(inputs).toBeDefined();
          expect(inputs instanceof Inputs).toBe(true);
          expect(inputs.length).toBe(2);
          expect(inputs[0].createdAt).toBeDefined();
          expect(inputs[0].id).toBeDefined();
          expect(inputs[0].rawData).toBeDefined();
          pollStatus(function(interval) {
            app.inputs.getStatus().then(
              function(data) {
                if (data['counts']['to_process'] == 0) {
                  clearInterval(interval);
                  if (data['errors'] > 0) {
                    throw new Error('Error processing inputs', data);
                  } else {
                    done();
                  }
                }
              },
              errorHandler.bind(done)
            );
          });
        },
        errorHandler.bind(done)
      );
    });

    it('Bulk adds inputs with concepts', function(done) {
      app.inputs.create([
        {
          url: sampleImage6,
          allowDuplicateUrl: true,
          concepts: [
            {id: ferrariId},
            {id: 'outdoors', value: false},
            {id: langConceptId}
          ]
        },
        {
          url: sampleImage7,
          allowDuplicateUrl: true,
          concepts: [
            {
              id: ferrariId
            },
            {
              id: 'outdoors',
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
          expect(inputs[0].rawData).toBeDefined();
          pollStatus(function(interval) {
            app.inputs.getStatus().then(
              function(data) {
                lastCount = data['counts']['processed'];
                if (data['counts']['to_process'] == 0) {
                  clearInterval(interval);
                  if (data['errors'] > 0) {
                    throw new Error('Error processing inputs', data);
                  } else {
                    done();
                  }
                }
              },
              errorHandler.bind(done)
            );
          });
        },
        errorHandler.bind(done)
      );
    });

    it('Gets all inputs', function(done) {
      app.inputs.list({
        page: 1,
        perPage: 5
      }).then(
        function(inputs) {
          expect(inputs).toBeDefined();
          expect(inputs instanceof Inputs).toBe(true);
          expect(inputs.length).toBe(5);
          var input = inputs[0];
          expect(input.id).toBeDefined();
          expect(input.createdAt).toBeDefined();
          expect(input.rawData).toBeDefined();
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
          expect(input.rawData).toBeDefined();
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
          expect(counts.errors).toBe(0);
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Updates an input by merging concepts', function(done) {
      app.inputs.mergeConcepts([
        {
          id: inputId,
          concepts: [
            {'id': 'train', 'value': true},
            {'id': 'car', 'value': false}
          ]
        }
      ]).then(
        function(inputs) {
          expect(inputs).toBeDefined();
          expect(inputs.length).toBe(1);
          expect(inputs instanceof Inputs).toBe(true);
          expect(inputs[0].createdAt).toBeDefined();
          expect(inputs[0].id).toBeDefined();
          expect(inputs[0].rawData).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Updates an input by overwriting concepts', function(done) {
      app.inputs.overwriteConcepts([
        {
          id: inputId,
          concepts: [
            {'id': 'train', 'value': false},
            {'id': 'car', 'value': true},
            {'id': 'car2', 'value': false},
            {'id': 'car3', 'value': false}
          ]
        }
      ]).then(
        function(inputs) {
          expect(inputs).toBeDefined();
          expect(inputs.length).toBe(1);
          expect(inputs instanceof Inputs).toBe(true);
          expect(inputs[0].concepts.length).toBe(4);
          for (var i = 0; i < inputs[0].concepts; i++) {
            switch (inputs[0].concepts[i].name) {
              case 'train':
                expect(inputs[0].concepts[i].value).toBe(0);
                break;
              case 'car':
                expect(inputs[0].concepts[i].value).toBe(1);
                break;
              case 'car2':
                expect(inputs[0].concepts[i].value).toBe(0);
                break;
              case 'car3':
                expect(inputs[0].concepts[i].value).toBe(0);
                break;
            }
          }
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Updates an input by deleting concepts', function(done) {
      app.inputs.deleteConcepts([
        {
          id: inputId,
          concepts: [
            {'id': 'train'},
            {'id': 'car'},
            {'id': 'car2'},
            {'id': 'car3'}
          ]
        }
      ]).then(
        function(inputs) {
          expect(inputs).toBeDefined();
          expect(inputs.length).toBe(1);
          expect(inputs instanceof Inputs).toBe(true);
          expect(inputs[0].concepts.length).toBe(0);
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
    testModelId = 'vroom-vroom' + Date.now();

    it('Creates a new model', function(done) {
      app.models.create(testModelId, [
        {
          id: ferrariId
        },
        {
          id: langConceptId
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
      expect(function() {
        app.models.create({name: 'asdf'}, [{id: ferrariId}]);
      }).toThrow(new Error('The following param is required: Model ID'));
      done();
    });

    it('Creates a new model version and returns after it has finished', function(done) {
      testModel.train(true).then(
        function(model) {
          expect(model).toBeDefined();
          expect(model.modelVersion).toBeDefined();
          expect(model.rawData).toBeDefined();
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
          testModelVersionId = model.modelVersion.id;
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Call predict on models collection given a model id', function(done) {
      app.models.predict(Clarifai.GENERAL_MODEL, [
        {
          url: sampleImage8
        },
        {
          url: sampleImage9
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
    it('Call predict on video inputs', function(done) {
      app.models.predict(Clarifai.GENERAL_MODEL, sampleVideo1, {video: true}).then(
        function(response) {
          expect(response.outputs).toBeDefined();
          var outputs = response.outputs;
          expect(outputs.length).toBe(1);
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
      ).catch(done);
    });
    it('Attaches model outputs', function(done) {
      app.models.initModel(Clarifai.GENERAL_MODEL).then(function(generalModel) {
        generalModel.predict([
          {
            url: sampleImage8
          },
          {
            url: sampleImage9
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
        )
      });
    });

    it('Can predict on public models in a different language (simplified chinese)', function(done) {
      app.models.initModel(Clarifai.GENERAL_MODEL).then(function(generalModel) {
        generalModel.predict(sampleImage1, {language: 'zh'}).then(
          function(response) {
            expect(response.outputs).toBeDefined();
            var concepts = response['outputs'][0]['data']['concepts']
            expect(concepts[0]['id']).toBe('ai_HLmqFqBf');
            expect(concepts[0]['name']).toBe('铁路列车');
            expect(concepts[1]['id']).toBe('ai_fvlBqXZR')
            expect(concepts[1]['name']).toBe('铁路')
            done();
          },
          errorHandler.bind(done)
        )
      });
    });

    it('Can predict on public models in a different language (japanese)', function(done) {
      app.models.initModel(Clarifai.GENERAL_MODEL).then(function(generalModel) {
        generalModel.predict(sampleImage1, {language: 'ja'}).then(
          function(response) {
            expect(response.outputs).toBeDefined();
            var concepts = response['outputs'][0]['data']['concepts']
            expect(concepts[0]['id']).toBe('ai_HLmqFqBf');
            expect(concepts[0]['name']).toBe('列車');
            expect(concepts[1]['id']).toBe('ai_fvlBqXZR')
            expect(concepts[1]['name']).toBe('鉄道')
            done();
          },
          errorHandler.bind(done)
        )
      });
    });
    it('Can predict on public models using a string for language (simplified chinese)', function(done) {
      app.models.initModel(Clarifai.GENERAL_MODEL).then(function(generalModel) {
        generalModel.predict(sampleImage1, 'zh').then(
          function(response) {
            expect(response.outputs).toBeDefined();
            var concepts = response['outputs'][0]['data']['concepts']
            expect(concepts[0]['id']).toBe('ai_HLmqFqBf');
            expect(concepts[0]['name']).toBe('铁路列车');
            expect(concepts[1]['id']).toBe('ai_fvlBqXZR')
            expect(concepts[1]['name']).toBe('铁路')
            done();
          },
          errorHandler.bind(done)
        )
      });
    });
    it('Can predict on public models in a different language (russian)', function(done) {
      app.models.initModel(Clarifai.GENERAL_MODEL).then(function(generalModel) {
        generalModel.predict(sampleImage1, {language: 'ru'}).then(
          function(response) {
            expect(response.outputs).toBeDefined();
            var concepts = response['outputs'][0]['data']['concepts']
            expect(concepts[0]['id']).toBe('ai_HLmqFqBf');
            expect(concepts[0]['name']).toBe('поезд');
            expect(concepts[1]['id']).toBe('ai_fvlBqXZR')
            expect(concepts[1]['name']).toBe('железная дорога')
            done();
          },
          errorHandler.bind(done)
        )
      });
    });
    it('Can set a max number of concepts returned for a model', done => {
      const MAX_CONCEPTS = 2;
      app.models.initModel(Clarifai.GENERAL_MODEL)
        .then(generalModel => generalModel.predict(sampleImage1, {maxConcepts: MAX_CONCEPTS}))
        .then(response => {
          expect(response.outputs).toBeDefined();
          const concepts = response['outputs'][0]['data']['concepts'];
          expect(concepts.length).toBe(MAX_CONCEPTS);
          expect(concepts[0]['id']).toBe('ai_HLmqFqBf');
          expect(concepts[0]['name']).toBe('train');
          expect(concepts[1]['id']).toBe('ai_fvlBqXZR');
          expect(concepts[1]['name']).toBe('railway');
          done();
        }).catch(errorHandler.bind(done));
    });
    it('Can set a min value threshold for concepts', done => {
      const MIN_VALUE = 0.95;
      app.models.initModel(Clarifai.GENERAL_MODEL)
        .then(generalModel => generalModel.predict(sampleImage1, {minValue: MIN_VALUE}))
        .then(response => {
          expect(response.outputs).toBeDefined();
          const concepts = response['outputs'][0]['data']['concepts'];
          concepts.forEach(c => expect(c.value).toBeGreaterThan(MIN_VALUE));
          expect(concepts[0]['id']).toBe('ai_HLmqFqBf');
          expect(concepts[0]['name']).toBe('train');
          expect(concepts[1]['id']).toBe('ai_fvlBqXZR');
          expect(concepts[1]['name']).toBe('railway');
          done();
        })
        .catch(errorHandler.bind(done));
    });
    it('Can select concepts to return', done => {
      const selectConcepts = [
        {name: 'train'},
        {id: 'ai_6kTjGfF6'}
      ];

      app.models.initModel(Clarifai.GENERAL_MODEL)
        .then(generalModel => generalModel.predict(sampleImage1, {selectConcepts}))
        .then(response => {
          expect(response.outputs).toBeDefined();
          const concepts = response['outputs'][0]['data']['concepts'];
          expect(concepts.length).toBe(selectConcepts.length);
          expect(concepts[0]['id']).toBe('ai_HLmqFqBf');
          expect(concepts[0]['name']).toBe('train');
          expect(concepts[1]['id']).toBe('ai_6kTjGfF6');
          expect(concepts[1]['name']).toBe('station');
          done();
        }).catch(errorHandler.bind(done));
    });
    it('Can provide feedback on regions', done => {
      const feedbackObject = {
        id: 'ea68cac87c304b28a8046557062f34a0',
        data: {
          'regions': [
            {
              'region_info': {
                'bounding_box': {
                  'top_row': 0.3,
                  'left_col': 0.2,
                  'bottom_row': 0.7,
                  'right_col': 0.8
                }
              },
              'data': {
                'concepts': [
                  {'id': 'train', 'value': true},
                  {'id': 'car', 'value': false}
                ]
              }
            }
          ],
          'concepts': [
            {'id': 'train', 'value': true},
            {'id': 'car', 'value': false}
          ]
        },
        info: {
          'endUserId': '{{end_user_id}}',
          'sessionId': '{{session_id}}',
          'outputId': '{{output_id}}'
        }
      };

      app.models.initModel(Clarifai.GENERAL_MODEL)
        .then(generalModel => generalModel.feedback(sampleImage1, feedbackObject))
        .then(response => {
          expect(response.status.description).toBe('Ok');
          done();
        })
        .catch(errorHandler.bind(done));
    });
    it('Can provide feedback on concepts', done => {
      const feedbackObject = {
        id: 'ea68cac87c304b28a8046557062f34a0',
        data: {
          concepts: [
            {'id': 'train', 'value': true},
            {'id': 'car', 'value': false}
          ]
        },
        info: {
          'endUserId': '{{end_user_id}}',
          'sessionId': '{{session_id}}',
          'outputId': '{{output_id}}'
        }
      };
      app.models.initModel(Clarifai.GENERAL_MODEL)
        .then(generalModel => generalModel.feedback(sampleImage1, feedbackObject))
        .then(response => {
          expect(response.status.description).toBe('Ok');
          done();
        })
        .catch(errorHandler.bind(done));
    });
    it('Can provide feedback on faces', done => {
      const feedbackObject = {
        id: 'ea68cac87c304b28a8046557062f34a0',
        data: {
          'regions': [
            {
              'region_info': {
                'bounding_box': {
                  'top_row': 0.3,
                  'left_col': 0.2,
                  'bottom_row': 0.7,
                  'right_col': 0.8
                }
              },
              'data': {
                'face': {
                  'identity': {
                    'concepts': [
                      {'id': 'black or african american', 'value': true},
                      {'id': 'white', 'value': false}
                    ]
                  },
                  'age_appearance': {
                    'concepts': [
                      {'id': '24', 'value': true},
                      {'id': '32', 'value': false}
                    ]
                  }
                }
              }
            }
          ]
        },
        info: {
          'endUserId': '{{end_user_uid}}',
          'sessionId': '{{session_id}}',
          'outputId': '{{output_id}}'
        }
      };
      app.models.initModel(Clarifai.GENERAL_MODEL)
        .then(generalModel => generalModel.feedback(sampleImage1, feedbackObject))
        .then(response => {
          expect(response.status.description).toBe('Ok');
          done();
        })
        .catch(errorHandler.bind(done));
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
              var conceptsIdsCopy = conceptsIds.slice(0);
              var totalFound = 0;
              for (var i = 0; i < model.outputInfo.data.concepts.length; i++) {
                var currConcept = model.outputInfo.data.concepts[i];
                var pos = conceptsIdsCopy.indexOf(currConcept.id);
                if (pos > -1) {
                  totalFound++;
                  conceptsIdsCopy.splice(pos, 1)
                }
              }
              expect(totalFound).toBe(conceptsIds.length);
              done();
            },
            errorHandler.bind(done)
          );
        },
        errorHandler.bind(done)
      );
    });

    it('Updates model by merging concepts', function(done) {
      var testConcepts = ['random-concept-1', 'random-concept-2'];
      app.models.mergeConcepts({
        id: testModel.id,
        concepts: testConcepts
      }).then(
        function(models) {
          models[0].getOutputInfo().then(
            function(model) {
              expect(model.outputInfo).toBeDefined();
              expect(model.outputInfo.data.concepts.length).toBe(conceptsIds.length + testConcepts.length);
              conceptsCount = model.outputInfo.data.concepts.length;
              var conceptsCopy = Array.from(model.outputInfo.data.concepts).map(function(el) {
                return el.id;
              });
              var totalFound = 0;
              for (var i = 0; i < testConcepts.length; i++) {
                var pos = conceptsCopy.indexOf(testConcepts[i]);
                if (pos > -1) {
                  totalFound++;
                  conceptsCopy.splice(pos, 1);
                }
              }
              expect(totalFound).toBe(2);
              done();
            },
            errorHandler.bind(done)
          );
        },
        errorHandler.bind(done)
      );
    });

    it('Updates a single model', function(done) {
      var testConcepts = ['random-concept-0'];
      app.models.initModel(testModel.id).then(function(model) {
          model.mergeConcepts(testConcepts).then(
            function(response) {
              expect(response.outputInfo).toBeDefined();
              expect(response.modelVersion.active_concept_count > conceptsCount).toBe(true);
              done();
            },
            errorHandler.bind(done)
          ).catch(
            errorHandler.bind(done)
          );
        },
        errorHandler.bind(done)
      ).catch(
        errorHandler.bind(done)
      );
    });

    it('Updates model by overwriting concepts', function(done) {
      var testConcepts = ['random-concept-1', 'random-concept-3', 'random-concept-4'];
      app.models.overwriteConcepts({
        id: testModel.id,
        concepts: testConcepts
      }).then(
        function(models) {
          models[0].getOutputInfo().then(
            function(model) {
              expect(model.outputInfo).toBeDefined();
              expect(model.outputInfo.data.concepts.length).toBe(testConcepts.length);
              done();
            },
            errorHandler.bind(done)
          );
        },
        errorHandler.bind(done)
      );
    });

    it('Updates model by deleting concepts', function(done) {
      app.models.deleteConcepts({
        id: testModel.id,
        concepts: [
          'random-concept-1',
          'random-concept-2',
          'random-concept-3',
          'random-concept-4'
        ]
      }).then(
        function(models) {
          models[0].getOutputInfo().then(
            function(model) {
              expect(model.outputInfo.data).toBeUndefined();
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
        {input: {url: sampleImage1}}
      ]).then(
        function(response) {
          expect(response.hits[0].score).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Filter by concepts/inputs only', function(done) {
      app.inputs.search([
        {input: {url: sampleImage1}},
        {input: {url: sampleImage5}}
      ]).then(
        function(response) {
          expect(response.hits[0].score).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Filter by images and concepts', function(done) {
      app.inputs.search([
        {input: {url: sampleImage1}},
        {concept: {name: ferrariId}}
      ]).then(
        function(response) {
          expect(response.hits[0].score).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      )
    });

    it('Filter by image id', function(done) {
      app.inputs.search({input: {id: inputId1}}).then(
        function(response) {
          expect(response.hits[0].score).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      )
    });

    it('Filter by image id and url', function(done) {
      app.inputs.search({input: {id: inputId1, url: sampleImage1}}).then(
        function(response) {
          expect(response.hits[0].score).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      )
    });

    it('Filter with metadata only', function(done) {
      app.inputs.search([
        {input: {metadata: {baz: 'blah'}, type: 'input'}}
      ]).then(
        function(response) {
          expect(response.hits[0].score).toBeDefined();
          expect(response.hits.length).toBe(2);
          done();
        },
        errorHandler.bind(done)
      )
    });

    it('Filter with geopoint and a radius', function(done) {
      app.inputs.search({
        input: {
          geo: {
            longitude: -19,
            latitude: 43,
            type: 'withinRadians',
            value: 1
          }
        }
      }).then(
        function(response) {
          expect(response.hits.length).toBe(3);
          expect(response.hits[0].score).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Filter with geo box', function(done) {
      app.inputs.search({
        input: {
          geo: [{
            latitude: 41,
            longitude: -31
          }, {
            latitude: 43.05,
            longitude: -19
          }]
        }
      }).then(
        function(response) {
          expect(response.hits.length).toBe(2);
          expect(response.hits[0].score).toBeDefined();
          expect(response.hits[1].score).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Filter with metadata and geodata', function(done) {
      app.inputs.search({
        input: {
          metadata: {
            test: [1, 2, 3, 4]
          },
          geo: [{
            latitude: 41,
            longitude: -31
          }, {
            latitude: 43.05,
            longitude: -19
          }]
        }
      }).then(
        function(response) {
          expect(response.hits[0].score).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Filter with metadata and image url', function(done) {
      app.inputs.search({
        input: {
          url: sampleImage4,
          metadata: {
            foo: 'bar'
          }
        }
      }).then(
        function(response) {
          expect(response.hits.length).toBe(1);
          expect(response.hits[0].score).toBeDefined();
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Search with concept in a different language (japanese)', function(done) {
      app.inputs.search({
        concept: {
          name: langConceptId,
          type: 'input'
        },
        language: 'ja'
      }).then(
        function(response) {
          expect(response.hits.length).toBe(1);
          done();
        },
        errorHandler.bind(done)
      );
    });
  });

  describe('Delete Resources', function() {
    it('Allows you to delete select inputs', function(done) {
      app.inputs.delete(inputsIDs.slice(0, 1)).then(
        function(response) {
          var data = response.data;
          expect(data.status).toBeDefined();
          expect(data.status.code).toBe(10000);
          expect(data.status.description).toBe('Ok');
          pollStatus(function(interval) {
            app.inputs.getStatus().then(
              function(data) {
                if (data['counts']['processed'] == lastCount - 1) {
                  clearInterval(interval);
                  done();
                }
              },
              errorHandler.bind(done)
            );
          });
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

    it('Throws an error if model delete arguments list is incorrect', function(done) {
      expect(function() {
        app.models.delete(['model-1', 'model-2'], 'version-1');
      }).toThrow();
      done();
    });

    it('Allows you to delete a single model version', function(done) {
      app.models.delete(testModelId, testModelVersionId).then(
        function(response) {
          expect(response.status).toBeDefined();
          expect(response.status.code).toBe(10000);
          expect(response.status.description).toBe('Ok');
          done();
        },
        errorHandler.bind(done)
      );
    });

    it('Allows you to delete a list of models', function(done) {
      var modelIds = [
        'abc' + Date.now(),
        'def' + Date.now(),
        'ghi' + Date.now(),
        'jkl' + Date.now()
      ];
      var completed = 0;
      var totalToDelete = 4;

      modelIds.forEach(function(modelId) {
        app.models.create(modelId).then(
          function(response) {
            completed++;
            if (completed === totalToDelete) {
              app.models.delete(modelIds).then(
                function(response) {
                  expect(response.status).toBeDefined();
                  expect(response.status.code).toBe(10000);
                  expect(response.status.description).toBe('Ok');
                  done();
                },
                errorHandler.bind(done)
              );
            }
          },
          errorHandler.bind(done)
        );
      });
    });

    it('Allows you to delete a single model', function(done) {
      var modelId = 'abc' + Date.now();
      app.models.create(modelId).then(
        function(response) {
          app.models.delete(modelId).then(
            function(response) {
              expect(response.status).toBeDefined();
              expect(response.status.code).toBe(10000);
              expect(response.status.description).toBe('Ok');
              done();
            },
            errorHandler.bind(done)
          );
        },
        errorHandler.bind(done)
      );
    });

    it('Allows you to delete a single model with id given in array', function(done) {
      var modelId = 'abc' + Date.now();
      app.models.create(modelId).then(
        function(response) {
          app.models.delete([modelId]).then(
            function(response) {
              expect(response.status).toBeDefined();
              expect(response.status.code).toBe(10000);
              expect(response.status.description).toBe('Ok');
              done();
            },
            errorHandler.bind(done)
          );
        },
        errorHandler.bind(done)
      );
    });

    it('Allows you to have special chars in model id', function(done) {
      var modelId = 'whois?' + Date.now();
      app.models.create(modelId).then(
        function(response) {
          app.models.get(modelId).then(
            function(response) {
              expect(response instanceof Model).toBe(true);
              expect(response.rawData.id).toBe(modelId);
              done();
            },
            errorHandler.bind(done)
          );
        },
        errorHandler.bind(done)
      );
    });

    it('Allows you to delete all models', function(done) {
      app.models.delete().then(
        function(response) {
          expect(response.status).toBeDefined();
          expect(response.status.code).toBe(10000);
          expect(response.status.description).toBe('Ok');
          done();
        },
        errorHandler.bind(done)
      );
    });
  });

  describe('Workflow', () => {
    it('Call given workflow id with one input', done => {
      testWorkflowId = 'big-bang' + Date.now();
      app.workflow.create(testWorkflowId, {
        modelId: Clarifai.GENERAL_MODEL,
        modelVersionId: generalModelVersionId
      }).then(workflowId => {
        app.workflow.predict(workflowId, sampleImage1)
          .then(response => {
            expect(response.workflow).toBeDefined();
            const result = response.results[0];
            const input = result.input;
            expect(input.id).toBeDefined();
            expect(input.data).toBeDefined();
            const outputs = result.outputs;
            const output = outputs[0];
            expect(output.id).toBeDefined();
            expect(output.status).toBeDefined();
            expect(output.created_at).toBeDefined();
            expect(output.model).toBeDefined();
            expect(output.model.model_version).toBeDefined();
            done();
        }).catch(errorHandler.bind(done));
      });
    });

    it('Call given workflow id with multiple inputs with specified types', done => {
      app.workflow.predict(testWorkflowId, [
        {
          url: sampleImage1,
          allowDuplicateUrl: true
        },
        {
          url: sampleImage2,
          allowDuplicateUrl: true
        }
      ]).then(response => {
        expect(response.workflow).toBeDefined();
        const results = response.results;
        expect(results.length).toBe(2);
        const result = results[0];
        const input = result.input;
        expect(input.id).toBeDefined();
        expect(input.data).toBeDefined();
        const output = result.outputs[0];
        expect(output.id).toBeDefined();
        expect(output.status).toBeDefined();
        expect(output.created_at).toBeDefined();
        expect(output.model).toBeDefined();
        expect(output.model.model_version).toBeDefined();
        done();
      }).catch(errorHandler.bind(done));
    });

    it('Call given workflow id with multiple inputs without specified types', done => {
      app.workflow.predict(testWorkflowId, [
        sampleImage8,
        sampleImage9
      ]).then(response => {
        expect(response.workflow).toBeDefined();
        const results = response.results;
        expect(results.length).toBe(2);
        const result = results[0];
        const input = result.input;
        expect(input.id).toBeDefined();
        expect(input.data).toBeDefined();
        const output = result.outputs[0];
        expect(output.id).toBeDefined();
        expect(output.status).toBeDefined();
        expect(output.created_at).toBeDefined();
        expect(output.model).toBeDefined();
        expect(output.model.model_version).toBeDefined();
        app.workflow.delete(testWorkflowId).then(response => {
          done();
        }).catch(errorHandler.bind(done));
      }).catch(errorHandler.bind(done));
    });
  });
});


function pollStatus(fn) {
  var getStatus = setInterval(function() {
    fn(getStatus)
  }, 1000);
}

function responseHandler(response) {
  expect(true).toBe(true);
  this();
}

function errorHandler(err) {
  expect(err.status).toBe(true);
  expect(err.data).toBe(true);
  if (err.data) {
    log(err.data);
  } else {
    log(err);
  }
  this();
}

function log(obj) {
  try {
    console.log('[ERROR]', JSON.stringify(obj));
  } catch(e) {
    console.log(e);
  }
};
