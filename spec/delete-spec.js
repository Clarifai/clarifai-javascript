const Clarifai = require('./../src');
const Model = require('./../src/Model');
const {errorHandler, pollStatus} = require('./helpers');
const {sampleImages} = require('./test-data');

let app;
let lastCount;
let testModelVersionId;
let inputsIDs = [];
let d = Date.now();
let testModelId = 'vroom-vroom' + d;

describe('Delete Resources', () => {

  beforeAll(done => {
    app = new Clarifai.App({
      apiKey: process.env.CLARIFAI_API_KEY,
      apiEndpoint: process.env.API_ENDPOINT,
    });

    app.inputs.create([
      {
        url: sampleImages[0],
        allowDuplicateUrl: true
      },
      {
        url: sampleImages[1],
        allowDuplicateUrl: true
      }
    ])
      .then(inputs => {
        for (var i=0; i<inputs.length; i++) {
          inputsIDs.push(inputs[i].id);
        }
        pollStatus(interval => {
          app.inputs.getStatus()
            .then(data => {
              lastCount = data['counts']['processed'];
              if (data['counts']['to_process'] === 0) {
                clearInterval(interval);
                if (data['errors'] > 0) {
                  throw new Error('Error processing inputs', data);
                } else {
                  done();
                }
              }
            })
            .catch(errorHandler.bind(done));
        });
      })
      .catch(errorHandler.bind(done));
  });

  it('Allows you to delete select inputs', done => {
    app.inputs.delete(inputsIDs.slice(0, 1))
      .then(response => {
        var data = response.data;
        expect(data.status).toBeDefined();
        expect(data.status.code).toBe(10000);
        expect(data.status.description).toBe('Ok');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Allows you to delete all inputs', done => {
    app.inputs.delete()
      .then(response => {
        var data = response.data;
        expect(data.status).toBeDefined();
        expect(data.status.code).toBe(10000);
        expect(data.status.description).toBe('Ok');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Throws an error if model delete arguments list is incorrect', done => {
    expect(() => {
      app.models.delete(['model-1', 'model-2'], 'version-1');
    }).toThrow();
    done();
  });

  it('Allows you to delete a single model version', done => {
    app.models.create(testModelId)
      .then(response => {
        testModelVersionId = response.modelVersion.id;
        return app.models.delete(testModelId, testModelVersionId);
      })
      .then(response => {
        expect(response.status).toBeDefined();
        expect(response.status.code).toBe(10000);
        expect(response.status.description).toBe('Ok');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Allows you to delete a list of models', done => {
    var modelIds = [
      'abc' + Date.now(),
      'def' + Date.now(),
      'ghi' + Date.now(),
      'jkl' + Date.now()
    ];
    var completed = 0;
    var totalToDelete = 4;

    modelIds.forEach(modelId => {
      app.models.create(modelId)
        .then(response => {
          completed++;
          if (completed === totalToDelete) {
            app.models.delete(modelIds)
              .then(response => {
                expect(response.status).toBeDefined();
                expect(response.status.code).toBe(10000);
                expect(response.status.description).toBe('Ok');
                done();
              })
              .catch(errorHandler.bind(done));
          }
        })
        .catch(errorHandler.bind(done));
    });
  });

  it('Allows you to delete a single model', done => {
    var modelId = 'abc' + Date.now();
    app.models.create(modelId)
      .then(response => {
        return app.models.delete(modelId);
      })
      .then(response => {
        expect(response.status).toBeDefined();
        expect(response.status.code).toBe(10000);
        expect(response.status.description).toBe('Ok');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Allows you to delete a single model with id given in array', done => {
    var modelId = 'abc' + Date.now();
    app.models.create(modelId)
      .then(response => {
        return app.models.delete([modelId]);
      })
      .then(response => {
        expect(response.status).toBeDefined();
        expect(response.status.code).toBe(10000);
        expect(response.status.description).toBe('Ok');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Allows you to have special chars in model id', done => {
    var modelId = 'whois?' + Date.now();
    app.models.create(modelId)
      .then(response => {
        return app.models.get(modelId);
      })
      .then(response => {
        expect(response instanceof Model).toBe(true);
        expect(response.rawData.id).toBe(modelId);
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Allows you to delete all models', done => {
    app.models.delete()
      .then(response => {
        expect(response.status).toBeDefined();
        expect(response.status.code).toBe(10000);
        expect(response.status.description).toBe('Ok');
        done();
      })
      .catch(errorHandler.bind(done));
  });
});
