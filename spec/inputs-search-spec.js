const Clarifai = require('./../src');
const {sampleImages} = require('./test-data');
const {errorHandler, pollStatus} = require('./helpers');
const Inputs = require('./../src/Inputs');
const d = Date.now();
const ferrariId = 'ferrari' + d;
const inputId1 = 'foobar' + d;
const inputId2 = 'foobaz' + d;
const inputId3 = 'input-with-geodata-1' + d;
const inputId4 = 'input-with-geodata-2' + d;
const inputId5 = 'input-with-geodata-3' + d;
const langConceptId = '的な' + d;
const beerId = 'beer' + d;
const testModelId = 'vroom-vroom' + d;

let app;
let inputId;
let lastCount;

describe('Inputs', () => {

  beforeAll(done => {
    app = new Clarifai.App({
      apiKey: process.env.CLARIFAI_API_KEY,
      apiEndpoint: process.env.API_ENDPOINT
    });

    app.inputs.delete()
      .then(response => {
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Adds an input', done => {
    app.inputs.create([
      {
        url: sampleImages[0],
        allowDuplicateUrl: true
      }
    ])
      .then(inputs => {
        expect(inputs).toBeDefined();
        expect(inputs instanceof Inputs).toBe(true);
        expect(inputs.length).toBe(1);
        expect(inputs[0].createdAt).toBeDefined();
        expect(inputs[0].id).toBeDefined();
        inputId = inputs[0].id;
        expect(inputs[0].rawData).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Adds an input with concepts', done => {
    app.inputs.create([
      {
        url: sampleImages[0],
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
    ])
      .then(inputs => {
        expect(inputs).toBeDefined();
        expect(inputs instanceof Inputs).toBe(true);
        expect(inputs.length).toBe(1);
        expect(inputs[0].createdAt).toBeDefined();
        expect(inputs[0].id).toBeDefined();
        expect(inputs[0].rawData).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Adds input with metadata', done => {
    app.inputs.create({
      id: inputId1,
      url: sampleImages[1],
      allowDuplicateUrl: true,
      concepts: [{id: beerId}],
      metadata: {foo: 'bar', baz: 'blah'}
    })
    .then(inputs => {
      expect(inputs).toBeDefined();
      expect(inputs instanceof Inputs).toBe(true);
      expect(inputs[0].id).toBe(inputId1);
      expect(inputs[0].rawData.data.metadata.foo).toBe('bar');
      expect(inputs[0].rawData.status.code === 30000);
      done();
    })
    .catch(errorHandler.bind(done));
  });

  it('Adds input with geodata', done => {
    app.inputs.create([
      {
        id: inputId3,
        url: sampleImages[0],
        allowDuplicateUrl: true,
        concepts: [{id: beerId}],
        geo: {longitude: -30, latitude: 40}
      },
      {
        id: inputId4,
        url: sampleImages[1],
        allowDuplicateUrl: true,
        concepts: [{id: beerId}],
        geo: {longitude: -20, latitude: 42.05},
        metadata: {test: [1, 2, 3, 4]}
      },
      {
        id: inputId5,
        url: sampleImages[2],
        allowDuplicateUrl: true,
        concepts: [{id: beerId}],
        geo: {longitude: -20, latitude: 42.05},
        metadata: {test: [1, 2, 3, 4]}
      }
    ])
      .then(inputs => {
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
        pollStatus(interval => {
          app.inputs.getStatus()
            .then(data => {
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

  it('Bulk adds inputs', done => {
    app.inputs.create([
      {
        url: sampleImages[0],
        allowDuplicateUrl: true
      },
      {
        url: sampleImages[4],
        allowDuplicateUrl: true
      }
    ])
      .then(inputs => {
        expect(inputs).toBeDefined();
        expect(inputs instanceof Inputs).toBe(true);
        expect(inputs.length).toBe(2);
        expect(inputs[0].createdAt).toBeDefined();
        expect(inputs[0].id).toBeDefined();
        expect(inputs[0].rawData).toBeDefined();
        pollStatus(interval => {
          app.inputs.getStatus()
            .then(data => {
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

  it('Bulk adds inputs with concepts', done => {
    app.inputs.create([
      {
        url: sampleImages[5],
        allowDuplicateUrl: true,
        concepts: [
          {id: ferrariId},
          {id: 'outdoors', value: false},
          {id: langConceptId}
        ]
      },
      {
        url: sampleImages[6],
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
    ])
      .then(inputs => {
        expect(inputs).toBeDefined();
        expect(inputs instanceof Inputs).toBe(true);
        expect(inputs.length).toBe(2);
        expect(inputs[0].createdAt).toBeDefined();
        expect(inputs[0].id).toBeDefined();
        expect(inputs[0].rawData).toBeDefined();
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
        })
      })
      .catch(errorHandler.bind(done));
  });

  it('Gets all inputs', done => {
    app.inputs.list({
      page: 1,
      perPage: 5
    })
      .then(inputs => {
        expect(inputs).toBeDefined();
        expect(inputs instanceof Inputs).toBe(true);
        expect(inputs.length).toBe(5);
        var input = inputs[0];
        expect(input.id).toBeDefined();
        expect(input.createdAt).toBeDefined();
        expect(input.rawData).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Gets a single input by id', done => {
    app.inputs.get(inputId)
      .then(input => {
        expect(input).toBeDefined();
        expect(input.id).toBe(inputId);
        expect(input.createdAt).toBeDefined();
        expect(input.rawData).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Gets inputs status', done => {
    app.inputs.getStatus()
      .then(response => {
        expect(response.counts).toBeDefined();
        var counts = response.counts;
        expect(counts.processed).toBeDefined();
        expect(counts.to_process).toBeDefined();
        expect(counts.errors).toBeDefined();
        expect(counts.errors).toBe(0);
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Updates an input by merging concepts', done => {
    app.inputs.mergeConcepts([
      {
        id: inputId,
        concepts: [
          {'id': 'train', 'value': true},
          {'id': 'car', 'value': false}
        ]
      }
    ])
      .then(inputs => {
        expect(inputs).toBeDefined();
        expect(inputs.length).toBe(1);
        expect(inputs instanceof Inputs).toBe(true);
        expect(inputs[0].createdAt).toBeDefined();
        expect(inputs[0].id).toBeDefined();
        expect(inputs[0].rawData).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Updates an input by overwriting concepts', done => {
    app.inputs.overwriteConcepts([
      {
        id: inputId,
        concepts: [
          {id: 'train', value: false},
          {id: 'car', value: true},
          {id: 'car2', value: false},
          {id: 'car3', value: false}
        ]
      }
    ])
      .then(inputs => {
        expect(inputs).toBeDefined();
        expect(inputs.length).toBe(1);
        expect(inputs instanceof Inputs).toBe(true);
        expect(inputs[0].concepts.length).toBe(4);
        for (let i = 0; i < inputs[0].concepts; i++) {
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
      })
      .catch(errorHandler.bind(done));
  });

  it('Updates an input by deleting concepts', done => {
    app.inputs.deleteConcepts([
      {
        id: inputId,
        concepts: [
          {id: 'train'},
          {id: 'car'},
          {id: 'car2'},
          {id: 'car3'}
        ]
      }
    ])
      .then(inputs => {
        expect(inputs).toBeDefined();
        expect(inputs.length).toBe(1);
        expect(inputs instanceof Inputs).toBe(true);
        expect(inputs[0].concepts.length).toBe(0);
        done();
      })
      .catch(errorHandler.bind(done));
  });
});


describe('Search', () => {
  beforeAll(done => {
    app.inputs.create({
      url: sampleImages[0],
      allowDuplicateUrl: true,
      concepts: [{id: ferrariId, value: true}]
    })
    .then(response => {
      return app.models.create(testModelId, [
        { id: ferrariId }
      ])
    })
    .then(testModel => {
      return testModel.train(true);
    })
    .then(model => {
      done();
    })
    .catch(errorHandler.bind(done));
  });

  it('Filter by images/inputs only', done => {
    app.inputs.search([
      { input: { url: sampleImages[0] } }
    ])
      .then(response => {
        expect(response.hits[0].score).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Filter by concepts/inputs only', done => {
    app.inputs.search([
      { input: { url: sampleImages[0] } },
      { input: { url: sampleImages[4]} }
    ])
      .then(response => {
        expect(response.hits[0].score).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Filter by images and concepts', done => {
    app.inputs.search([
      {input: {url: sampleImages[0]}},
      {concept: {name: ferrariId}}
    ])
      .then(response => {
        expect(response.hits[0].score).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Filter by image id', done => {
    app.inputs.search({input: {id: inputId1}})
      .then(response => {
        expect(response.hits[0].score).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Filter by image id and url', done => {
    app.inputs.search({input: {id: inputId1, url: sampleImages[0]}})
      .then(response => {
        expect(response.hits[0].score).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Filter with metadata only', done => {
    app.inputs.search([
      { input: { metadata: { baz: 'blah' }, type: 'input' } }
    ])
      .then(response => {
        expect(response.hits[0].score).toBeDefined();
        expect(response.hits.length).toBe(1);
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Filter with geopoint and a radius', done => {
    app.inputs.search({
      input: {
        geo: {
          longitude: -19,
          latitude: 43,
          type: 'withinRadians',
          value: 1
        }
      }
    })
      .then(response => {
        expect(response.hits.length).toBe(3);
        expect(response.hits[0].score).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Filter with geo box', done => {
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
    })
      .then(response => {
        expect(response.hits.length).toBe(2);
        expect(response.hits[0].score).toBeDefined();
        expect(response.hits[1].score).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Filter with metadata and geodata', done => {
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
    })
      .then(response => {
        expect(response.hits[0].score).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Filter with metadata and image url', done => {
    app.inputs.search({
      input: {
        url: sampleImages[3],
        metadata: {
          foo: 'bar'
        }
      }
    })
      .then(response => {
        expect(response.hits.length).toBe(1);
        expect(response.hits[0].score).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Search with concept in a different language (japanese)', done => {
    app.inputs.search({
      concept: {
        name: langConceptId,
        type: 'input'
      },
      language: 'ja'
    })
    .then(response => {
      expect(response.hits.length).toBe(1);

      app.inputs.delete()
        .then(() => {
          return app.models.delete();
        })
        .then(response => {
          expect(response.status).toBeDefined();
          done();
        })
    })
    .catch(errorHandler.bind(done));
  });
});
