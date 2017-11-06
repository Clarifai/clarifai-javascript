const Clarifai = require('./../src');
const {sampleImages, sampleVideos} = require('./test-data');
const {errorHandler} = require('./helpers');
const d = Date.now();
const ferrariId = 'ferrari' + d;
const langConceptId = '的な' + d;
const beerId = 'beer' + d;
const testModelId = 'vroom-vroom' + d;

let app;
let testModelVersionId;
let conceptsCount;

const conceptsIds = [
  'porsche' + Date.now(),
  'rolls royce' + Date.now(),
  'lamborghini' + Date.now(),
  langConceptId,
  beerId,
  ferrariId
];

describe('Models', () => {
  var testModel;

  beforeAll(() => {
    app = new Clarifai.App({
      apiKey: process.env.CLARIFAI_API_KEY,
      apiEndpoint: process.env.API_ENDPOINT
    });
  });

  it('Creates a new model', done => {
    app.models.create(testModelId, [
      {
        id: ferrariId
      },
      {
        id: langConceptId
      }
    ])
      .then(model => {
        expect(model).toBeDefined();
        expect(model.name).toBeDefined();
        expect(model.id).toBeDefined();
        testModel = model;
        expect(model.createdAt).toBeDefined();
        expect(model.appId).toBeDefined();
        expect(model.outputInfo).toBeDefined();
        expect(model.modelVersion).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Throws an error if no model id is given', done => {
    expect(() => {
      app.models.create({name: 'asdf'}, [{id: ferrariId}]);
    }).toThrow(new Error('The following param is required: Model ID'));
    done();
  });

  it('Creates a new model version and returns after it has finished', done => {
    testModel.train(true)
      .then(model => {
        expect(model).toBeDefined();
        expect(model.modelVersion).toBeDefined();
        expect(model.rawData).toBeDefined();
        var version = model.modelVersion;
        expect(version.id).toBeDefined();
        expect(version.created_at).toBeDefined();
        expect(version.status.code).toBe(21111);
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Adds inputs and trains the model', done => {
    app.inputs.delete()
      .then(() => {
        return app.inputs.create([
          {
            url: sampleImages[5],
            allowDuplicateUrl: true,
            concepts: [{id: ferrariId, value: true}]
          },
          {
            url: sampleImages[6],
            allowDuplicateUrl: true,
            concepts: [{id: langConceptId, value: true}]
          }
        ])
      })
      .then(() => testModel.train(true))
      .then(model => {
        expect(model).toBeDefined();
        expect(model.modelVersion).toBeDefined();
        expect(model.rawData).toBeDefined();
        var version = model.modelVersion;
        expect(version.id).toBeDefined();
        expect(version.created_at).toBeDefined();
        expect(version.status.code).toBe(21100);
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Searches for a model', done => {
    app.models.search(testModelId)
      .then(models => {
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
      })
      .catch(errorHandler.bind(done));
  });

  it('Starts a model eval job and returns the result of creating it', done => {
    testModel.train(true)
      .then(model => model.runModelEval())
      .then(modelVersion => {
        expect(modelVersion).toBeDefined();
        expect(modelVersion.metrics).toBeDefined();
        expect(modelVersion.metrics.status).toBeDefined();
        expect(modelVersion.metrics.status.code).toBe(21303);
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Call predict on models collection given a model id', done => {
    app.models.predict(Clarifai.GENERAL_MODEL, [
      {
        url: sampleImages[7]
      },
      {
        url: sampleImages[8]
      }
    ])
      .then(response => {
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
      })
      .catch(errorHandler.bind(done));
  });

  it('Call predict with a declared input id', done => {
    app.models.predict(Clarifai.GENERAL_MODEL, [
      {
        id: 'test-id-1',
        url: sampleImages[7]
      },
      {
        id: 'test-id-2',
        url: sampleImages[8]
      }
    ])
      .then(response => {
        expect(response.outputs).toBeDefined();
        expect(response.outputs[0].input.id).toBe('test-id-1');
        expect(response.outputs[1].input.id).toBe('test-id-2');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Call predict on video inputs', done => {
    app.models.predict(Clarifai.GENERAL_MODEL, sampleVideos[0], {video: true})
      .then(response => {
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
      })
      .catch(errorHandler.bind(done));
  });

  it('Attaches model outputs', done => {
    app.models.initModel(Clarifai.GENERAL_MODEL)
      .then(generalModel => {
        return generalModel.predict([
          {
            url: sampleImages[7]
          },
          {
            url: sampleImages[8]
          }
        ])
      })
      .then(response => {
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
      })
      .catch(errorHandler.bind(done));
  });

  it('Can predict on public models in a different language (simplified chinese)', done => {
    app.models.initModel(Clarifai.GENERAL_MODEL)
      .then(generalModel => {
        return generalModel.predict(sampleImages[0], {language: 'zh'});
      })
      .then(response => {
        expect(response.outputs).toBeDefined();
        var concepts = response['outputs'][0]['data']['concepts']
        expect(concepts[0]['id']).toBe('ai_HLmqFqBf');
        expect(concepts[0]['name']).toBe('铁路列车');
        expect(concepts[1]['id']).toBe('ai_fvlBqXZR');
        expect(concepts[1]['name']).toBe('铁路');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Can predict on public models in a different language (japanese)', done => {
    app.models.initModel(Clarifai.GENERAL_MODEL)
      .then(generalModel => {
        return generalModel.predict(sampleImages[0], {language: 'ja'});
      })
      .then(response => {
        expect(response.outputs).toBeDefined();
        var concepts = response['outputs'][0]['data']['concepts'];
        expect(concepts[0]['id']).toBe('ai_HLmqFqBf');
        expect(concepts[0]['name']).toBe('列車');
        expect(concepts[1]['id']).toBe('ai_fvlBqXZR');
        expect(concepts[1]['name']).toBe('鉄道');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Can predict on public models in a different language (russian)', done => {
    app.models.initModel(Clarifai.GENERAL_MODEL)
      .then(generalModel => {
        return generalModel.predict(sampleImages[0], {language: 'ru'});
      })
      .then(response => {
        expect(response.outputs).toBeDefined();
        var concepts = response['outputs'][0]['data']['concepts']
        expect(concepts[0]['id']).toBe('ai_HLmqFqBf');
        expect(concepts[0]['name']).toBe('поезд');
        expect(concepts[1]['id']).toBe('ai_fvlBqXZR');
        expect(concepts[1]['name']).toBe('железная дорога');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Can set a max number of concepts returned for a model', done => {
    const MAX_CONCEPTS = 2;
    app.models.initModel(Clarifai.GENERAL_MODEL)
      .then(generalModel => generalModel.predict(sampleImages[0], {maxConcepts: MAX_CONCEPTS}))
      .then(response => {
        expect(response.outputs).toBeDefined();
        const concepts = response['outputs'][0]['data']['concepts'];
        expect(concepts.length).toBe(MAX_CONCEPTS);
        expect(concepts[0]['id']).toBe('ai_HLmqFqBf');
        expect(concepts[0]['name']).toBe('train');
        expect(concepts[1]['id']).toBe('ai_fvlBqXZR');
        expect(concepts[1]['name']).toBe('railway');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Can set a min value threshold for concepts', done => {
    const MIN_VALUE = 0.95;
    app.models.initModel(Clarifai.GENERAL_MODEL)
      .then(generalModel => generalModel.predict(sampleImages[0], {minValue: MIN_VALUE}))
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
      .then(generalModel => generalModel.predict(sampleImages[0], {selectConcepts}))
      .then(response => {
        expect(response.outputs).toBeDefined();
        const concepts = response['outputs'][0]['data']['concepts'];
        expect(concepts.length).toBe(selectConcepts.length);
        expect(concepts[0]['id']).toBe('ai_HLmqFqBf');
        expect(concepts[0]['name']).toBe('train');
        expect(concepts[1]['id']).toBe('ai_6kTjGfF6');
        expect(concepts[1]['name']).toBe('station');
        done();
      })
      .catch(errorHandler.bind(done));
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
      .then(generalModel => generalModel.feedback(sampleImages[0], feedbackObject))
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
      .then(generalModel => generalModel.feedback(sampleImages[0], feedbackObject))
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
      .then(generalModel => generalModel.feedback(sampleImages[0], feedbackObject))
      .then(response => {
        expect(response.status.description).toBe('Ok');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Update model name and config', done => {
    app.models.update({
      id: testModel.id,
      name: 'Super Cars',
      conceptsMutuallyExclusive: true,
      closedEnvironment: true
    })
      .then(models => {
        expect(models).toBeDefined();
        expect(models[0]).toBeDefined();
        expect(models[0].id).toBe(testModel.id);
        expect(models[0].name).toBe('Super Cars');
        expect(models[0].outputInfo.output_config.concepts_mutually_exclusive).toBe(true);
        expect(models[0].outputInfo.output_config.closed_environment).toBe(true);
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Update model concepts', done => {
    app.models.update({
      id: testModel.id,
      concepts: conceptsIds
    })
    .then(models => {
      return models[0].getOutputInfo();
    })
    .then(model => {
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
    })
    .catch(errorHandler.bind(done));
  });

  it('Updates model by merging concepts', done => {
    var testConcepts = ['random-concept-1', 'random-concept-2'];
    app.models.mergeConcepts({
      id: testModel.id,
      concepts: testConcepts
    })
      .then(models => {
        return models[0].getOutputInfo();
      })
      .then(model => {
        expect(model.outputInfo).toBeDefined();
        expect(model.outputInfo.data.concepts.length).toBe(conceptsIds.length + testConcepts.length);
        conceptsCount = model.outputInfo.data.concepts.length;
        var conceptsCopy = Array.from(model.outputInfo.data.concepts).map(el => {
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
      })
      .catch(errorHandler.bind(done));
  });

  it('Updates a single model', done => {
    var testConcepts = ['random-concept-0'];
    app.models.initModel(testModel.id)
      .then(model => {
        return model.mergeConcepts(testConcepts);
      })
      .then(response => {
        expect(response.outputInfo).toBeDefined();
        expect(response.modelVersion.active_concept_count > conceptsCount).toBe(true);
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Updates model by overwriting concepts', done => {
    var testConcepts = ['random-concept-1', 'random-concept-3', 'random-concept-4'];
    app.models.overwriteConcepts({
      id: testModel.id,
      concepts: testConcepts
    })
      .then(models => {
        return models[0].getOutputInfo();
      })
      .then(model => {
        expect(model.outputInfo).toBeDefined();
        expect(model.outputInfo.data.concepts.length).toBe(testConcepts.length);
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Updates model by deleting concepts', done => {
    app.models.deleteConcepts({
      id: testModel.id,
      concepts: [
        'random-concept-1',
        'random-concept-2',
        'random-concept-3',
        'random-concept-4'
      ]
    })
      .then(models => {
        return models[0].getOutputInfo();
      })
      .then(model => {
        expect(model.outputInfo.data).toBeUndefined();
        return app.models.delete();
      })
      .then(response => {
        expect(response.status).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });
});
