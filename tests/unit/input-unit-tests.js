const Clarifai = require('./../../src');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const {errorHandler} = require('../integration/helpers');

let app;

let mock;

const BASE_URL = 'https://api.clarifai.com';

describe('Unit Tests - Inputs', () => {
  beforeAll(() => {
    app = new Clarifai.App({
      apiKey: process.env.CLARIFAI_API_KEY,
      apiEndpoint: process.env.API_ENDPOINT
    });
  });

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  it('Creates inputs', done => {
    mock.onPost(BASE_URL + '/v2/inputs').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "inputs": [
    {
      "id": "@inputID1",
      "data": {
        "image": {
          "url": "https://some.image.url1"
        },
        "geo": {
          "geo_point": {
            "longitude": 55,
            "latitude": 66
          }
        }
      },
      "created_at": "2019-01-17T12:43:04.895006174Z",
      "modified_at": "2019-01-17T12:43:04.895006174Z",
      "status": {
        "code": 30001,
        "description": "Download pending"
      }
    },
    {
      "id": "@inputID2",
      "data": {
        "image": {
          "url": "https://some.image.url2"
        }
      },
      "created_at": "2019-01-17T12:43:04.895006174Z",
      "modified_at": "2019-01-17T12:43:04.895006174Z",
      "status": {
        "code": 30001,
        "description": "Download pending"
      }
    }
  ]
}
    `));

    app.inputs.create([
      {
        url: 'https://some.image.url1',
        id: '@inputID1',
        allowDuplicateUrl: true,
        geo: {
          longitude: 55,
          latitude: 66,
        }
      },
      {
        url: 'https://some.image.url2',
        id: '@inputID2',
        allowDuplicateUrl: true,
      }
      ])
      .then(inputs => {
        expect(mock.history.post.length).toBe(1);

        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "inputs": [
    {
      "id": "@inputID1",
      "data": {
        "image": {
          "url": "https://some.image.url1",
          "allow_duplicate_url": true
        },
        "geo": {
          "geo_point": {
            "longitude": 55,
            "latitude": 66
          }
        }
      }
    },
    {
      "id": "@inputID2",
      "data": {
        "image": {
          "url": "https://some.image.url2",
          "allow_duplicate_url": true
        }
      }
    }
  ]
}
        `));

        expect(inputs[0].id).toEqual('@inputID1');
        expect(inputs[0].imageUrl).toEqual('https://some.image.url1');
        expect(inputs[0].geo).toEqual({geoPoint: {longitude: 55, latitude: 66}});

        expect(inputs[1].id).toEqual('@inputID2');
        expect(inputs[1].imageUrl).toEqual('https://some.image.url2');
        expect(inputs[1].geo).toBeUndefined();

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Updates inputs', done => {
    mock.onPatch(BASE_URL + '/v2/inputs').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "inputs": [{
    "id": "@inputID",
    "data": {
      "image": {
        "url": "@imageURL"
      },
      "concepts": [
        {
          "id": "@positiveConcept1",
          "name": "@positiveConceptName1",
          "value": 1
        },
        {
          "id": "@positiveConcept2",
          "value": 1
        },
        {
          "id": "@negativeConcept1",
          "name": "@negativeConceptName1",
          "value": 0
        },
        {
          "id": "@negativeConcept2",
          "value": 0
        }
      ]
    },
    "created_at": "2017-10-13T20:53:00.253139Z",
    "modified_at": "2017-10-13T20:53:00.868659782Z",
    "status": {
      "code": 30200,
      "description": "Input image modification success"
    }
  }]
}
    `));
    
    app.inputs.update(
      {
        id: '@inputID',
        concepts: [
          {
            id: "@positiveConcept1",
            name: "@positiveConceptName1"
          },
          {
            id: "@positiveConcept2"
          },
          {
            id: "@negativeConcept1",
            name: "@negativeConceptName1",
            value: 0
          },
          {
            id: "@negativeConcept2",
            value: 0
          }
        ],
        action: 'merge'
      }
    )
      .then(inputs => {
        expect(mock.history.patch.length).toBe(1);

        expect(JSON.parse(mock.history.patch[0].data)).toEqual(JSON.parse(`
{
  "inputs": [
    {
      "id": "@inputID",
      "data": {
        "concepts": [
          {
            "id": "@positiveConcept1",
            "name": "@positiveConceptName1"
          },
          {
            "id": "@positiveConcept2"
          },
          {
            "id": "@negativeConcept1",
            "name": "@negativeConceptName1",
            "value": 0
          },
          {
            "id": "@negativeConcept2",
            "value": 0
          }
        ]
      }
    }
  ],
  "action":"merge"
}
        `));

        expect(inputs[0].id).toEqual('@inputID');
        expect(inputs[0].imageUrl).toEqual('@imageURL');

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Updates input with region', done => {
    mock.onPatch(BASE_URL + '/v2/inputs').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "inputs": [
    {
      "id": "@inputID",
      "data": {
        "image": {
          "url": "@imageURL"
        },
        "concepts": [
          {
            "id": "@concept1",
            "name": "@concept1",
            "value": 1,
            "app_id": "@appID"
          },
          {
            "id": "@concept2",
            "name": "@concept2",
            "value": 0,
            "app_id": "@appID"
          }
        ]
      },
      "created_at": "2019-01-29T15:23:21.188492Z",
      "modified_at": "2019-01-29T15:23:21.575667Z",
      "status": {
        "code": 30200,
        "description": "Input image modification success"
      }
    }
  ]
}
    `));

    app.inputs.update(
      {
        id: '@inputID',
        regions: [
          {
            id: "@regionID",
            region_info: {
              bounding_box: {
                top_row: 0.1,
                left_col: 0.2,
                bottom_row: 0.3,
                right_col: 0.4
              },
              feedback: "misplaced"
            },
            data: {
              concepts: [
                {
                  id: "@concept1"
                },
                {
                  id: "@concept2",
                  value: 0
                }
              ],
              face: {
                identity: {
                  concepts: [
                    {
                      id: "@faceConcept1"
                    },
                    {
                      id: "@faceConcept2",
                      value: 0
                    }
                  ]
                }
              }
            }
          }
        ],
        action: 'overwrite'
      }
    )
      .then(inputs => {
        expect(mock.history.patch.length).toBe(1);

        expect(JSON.parse(mock.history.patch[0].data)).toEqual(JSON.parse(`
{
  "inputs": [
    {
      "id": "@inputID",
      "data": {
        "regions": [
          {
            "id": "@regionID",
            "region_info": {
              "bounding_box": {
                "top_row": 0.1,
                "left_col": 0.2,
                "bottom_row": 0.3,
                "right_col": 0.4
              },
              "feedback": "misplaced"
            },
            "data": {
              "concepts": [
                {
                  "id": "@concept1"
                },
                {
                  "id": "@concept2",
                  "value": 0
                }
              ],
              "face": {
                "identity": {
                  "concepts": [
                    {
                      "id": "@faceConcept1"
                    },
                    {
                      "id": "@faceConcept2",
                      "value": 0
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    }
  ],
  "action": "overwrite"
}
        `));

        expect(inputs[0].id).toEqual('@inputID');
        expect(inputs[0].imageUrl).toEqual('@imageURL');

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Updates input with metadata', done => {
    mock.onPatch(BASE_URL + '/v2/inputs').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "inputs": [{
    "id": "@inputID",
    "data": {
      "image": {
        "url": "@imageURL"
      },
      "concepts": [{
        "id": "concept1",
        "name": "concept1",
        "value": 1,
        "app_id": "@appID"
      }],
      "metadata": {
        "@key1": "@value1",
        "@key2": "@value2"
      }
    },
    "created_at": "2017-11-02T15:08:22.005157Z",
    "modified_at": "2017-11-02T15:08:23.071624222Z",
    "status": {
      "code": 30200,
      "description": "Input image modification success"
    }
  }]
}
    `));

    app.inputs.update(
      {
        id: '@inputID',
        metadata: {
          '@key1': '@value1',
          '@key2': '@value2',
        },
        action: 'overwrite'
      }
    )
      .then(inputs => {
        expect(mock.history.patch.length).toBe(1);

        expect(JSON.parse(mock.history.patch[0].data)).toEqual(JSON.parse(`
{
  "inputs": [
    {
      "id": "@inputID",
      "data": {
        "metadata": {
          "@key1": "@value1",
          "@key2": "@value2"
        }
      }
    }
  ],
  "action":"overwrite"
}
        `));

        expect(inputs[0].id).toEqual('@inputID');
        expect(inputs[0].imageUrl).toEqual('@imageURL');

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Lists inputs', done => {
    mock.onGet(BASE_URL + '/v2/inputs').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "inputs": [
    {
      "id": "@inputID1",
      "data": {
        "image": {
          "url": "https://some.image.url1"
        },
        "geo": {
          "geo_point": {
            "longitude": 55,
            "latitude": 66
          }
        }
      },
      "created_at": "2019-01-17T14:02:21.216473Z",
      "modified_at": "2019-01-17T14:02:21.800792Z",
      "status": {
        "code": 30000,
        "description": "Download complete"
      }
    },
    {
      "id": "@inputID2",
      "data": {
        "image": {
          "url": "https://some.image.url2"
        }
      },
      "created_at": "2019-01-17T14:02:21.216473Z",
      "modified_at": "2019-01-17T14:02:21.800792Z",
      "status": {
        "code": 30000,
        "description": "Download complete"
      }
    }
  ]
}
    `));

    app.inputs.list().then(inputs => {
      expect(mock.history.get.length).toBe(1);

      expect(inputs[0].id).toEqual('@inputID1');
      expect(inputs[0].imageUrl).toEqual('https://some.image.url1');
      expect(inputs[0].geo.geoPoint).toEqual({longitude: 55, latitude: 66});

      expect(inputs[1].id).toEqual('@inputID2');
      expect(inputs[1].imageUrl).toEqual('https://some.image.url2');
      expect(inputs[1].geo).toBeUndefined();

      done();
    })
    .catch(errorHandler.bind(done));
  });

  it('Gets input', done => {
    mock.onGet(BASE_URL + '/v2/inputs/%40inputID').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "input": {
    "id": "@inputID",
    "data": {
      "image": {
        "url": "https://some.image.url"
      },
      "geo": {
        "geo_point": {
          "longitude": 55,
          "latitude": 66
        }
      }
    },
    "created_at": "2019-01-17T14:02:21.216473Z",
    "modified_at": "2019-01-17T14:02:21.800792Z",
    "status": {
      "code": 30000,
      "description": "Download complete"
    }
  }
}
    `));

    app.inputs.get("@inputID").then(input => {
      expect(mock.history.get.length).toBe(1);

      expect(input.id).toEqual('@inputID');
      expect(input.imageUrl).toEqual('https://some.image.url');
      expect(input.geo.geoPoint).toEqual({longitude: 55, latitude: 66});

      done();
    })
      .catch(errorHandler.bind(done));
  });

  it("Gets inputs' status", done => {
    mock.onGet(BASE_URL + '/v2/inputs/status').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "counts": {
    "processed": 1,
    "to_process": 2,
    "errors": 3,
    "processing": 4,
    "reindexed": 5,
    "to_reindex": 6,
    "reindex_errors": 7,
    "reindexing": 8
  }
}
    `));

    app.inputs.getStatus().then(inputsStatus => {
      expect(mock.history.get.length).toBe(1);

      expect(inputsStatus.counts.processed).toEqual(1);
      expect(inputsStatus.counts.to_process).toEqual(2);
      expect(inputsStatus.counts.errors).toEqual(3);
      expect(inputsStatus.counts.processing).toEqual(4);
      expect(inputsStatus.counts.reindexed).toEqual(5);
      expect(inputsStatus.counts.to_reindex).toEqual(6);
      expect(inputsStatus.counts.reindex_errors).toEqual(7);
      expect(inputsStatus.counts.reindexing).toEqual(8);

      done();
    })
      .catch(errorHandler.bind(done));
  });

  it('Deletes all inputs', done => {
    mock.onDelete(BASE_URL + '/v2/inputs').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  }
}
    `));

    app.inputs.delete()
      .then(response => {
        expect(mock.history.delete.length).toBe(1);

        expect(JSON.parse(mock.history.delete[0].data)).toEqual(JSON.parse(`
{
  "delete_all": true
}
        `));

        expect(response.data.status.code).toEqual(10000);

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Deletes inputs', done => {
    mock.onDelete(BASE_URL + '/v2/inputs').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  }
}
    `));

    app.inputs.delete(['@inputID1', '@inputID2'])
      .then(response => {
        expect(mock.history.delete.length).toBe(1);

        expect(JSON.parse(mock.history.delete[0].data)).toEqual(JSON.parse(`
{
  "ids": [
    "@inputID1",
    "@inputID2"
  ]
}
        `));

        expect(response.data.status.code).toEqual(10000);

        done();
      })
      .catch(errorHandler.bind(done));
  });
});
