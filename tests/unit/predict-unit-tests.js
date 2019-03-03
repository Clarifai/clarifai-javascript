const Clarifai = require('./../../src');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const {errorHandler} = require('../integration/helpers');

let app;

let mock;

const BASE_URL = 'https://api.clarifai.com';

describe('Unit Tests - Predictions', () => {
  beforeAll(() => {
    app = new Clarifai.App({
      apiKey: process.env.CLARIFAI_API_KEY,
      apiEndpoint: process.env.API_ENDPOINT
    });
  });

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  it('Predicts', done => {
    mock.onPost(BASE_URL + '/v2/models/%40modelID/outputs').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "outputs": [{
    "id": "@outputID",
    "status": {
      "code": 10000,
      "description": "Ok"
    },
    "created_at": "2017-11-17T19:32:58.760477937Z",
    "model": {
      "id": "@modelID",
      "name": "@modelName",
      "created_at": "2016-03-09T17:11:39.608845Z",
      "app_id": "main",
      "output_info": {
        "message": "Show output_info with: GET /models/{model_id}/output_info",
        "type": "concept",
        "type_ext": "concept"
      },
      "model_version": {
        "id": "@modelVersionID",
        "created_at": "2016-07-13T01:19:12.147644Z",
        "status": {
          "code": 21100,
          "description": "Model trained successfully"
        }
      },
      "display_name": "@modelDisplayName"
    },
    "input": {
      "id": "@inputID",
      "data": {
        "image": {
          "url": "https://some-image-url"
        }
      }
    },
    "data": {
      "concepts": [{
        "id": "@conceptID1",
        "name": "@conceptName1",
        "value": 0.99,
        "app_id": "main"
      }, {
        "id": "@conceptID2",
        "name": "@conceptName2",
        "value": 0.98,
        "app_id": "main"
      }]
    }
  }]
}
    `));


    app.models.predict('@modelID', 'https://some-image-url')
      .then(response => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "inputs": [
    {
      "data": {
        "image": {
          "url": "https://some-image-url"
        }
      }
    }
  ]
}
        `));

        let output = response.outputs[0];

        expect(output.id).toEqual('@outputID');
        expect(output.input.id).toEqual('@inputID');
        expect(output.data.concepts[0].id).toEqual('@conceptID1');
        expect(output.model.id).toEqual('@modelID');

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Predicts with arguments', done => {
    mock.onPost(BASE_URL + '/v2/models/%40modelID/outputs').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "outputs": [
    {
      "id": "@outputID",
      "status": {
        "code": 10000,
        "description": "Ok"
      },
      "created_at": "2019-01-29T17:15:32.450063489Z",
      "model": {
        "id": "@modelID",
        "name": "@modelName",
        "created_at": "2016-03-09T17:11:39.608845Z",
        "app_id": "main",
        "output_info": {
          "message": "Show output_info with: GET /models/{model_id}/output_info",
          "type": "concept",
          "type_ext": "concept"
        },
        "model_version": {
          "id": "@modelVersionID",
          "created_at": "2016-07-13T01:19:12.147644Z",
          "status": {
            "code": 21100,
            "description": "Model trained successfully"
          },
          "train_stats": {}
        },
        "display_name": "General"
      },
      "input": {
        "id": "@inputID",
        "data": {
          "image": {
            "url": "https://some-image-url"
          }
        }
      },
      "data": {
        "concepts": [
          {
            "id": "@conceptID1",
            "name": "menschen",
            "value": 0.9963381,
            "app_id": "main"
          },
          {
            "id": "@conceptID2",
            "name": "ein",
            "value": 0.9879057,
            "app_id": "main"
          },
          {
            "id": "@conceptID3",
            "name": "Porträt",
            "value": 0.98490834,
            "app_id": "main"
          }
        ]
      }
    }
  ]
}
    `));


    app.models.predict('@modelID', 'https://some-image-url', {language: 'de', maxConcepts: 3, minValue: 0.98})
      .then(response => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "inputs": [
    {
      "data": {
        "image": {
          "url": "https://some-image-url"
        }
      }
    }
  ],
  "model": {
    "output_info": {
      "output_config": {
        "language": "de",
        "max_concepts": 3,
        "min_value": 0.98
      }
    }
  }
}
        `));

        let output = response.outputs[0];

        expect(output.id).toEqual('@outputID');
        expect(output.input.id).toEqual('@inputID');
        expect(output.data.concepts[0].id).toEqual('@conceptID1');
        expect(output.model.id).toEqual('@modelID');

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Batch predicts', done => {
    mock.onPost(BASE_URL + '/v2/models/%40modelID/outputs').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "outputs": [{
    "id": "@outputID1",
    "status": {
      "code": 10000,
      "description": "Ok"
    },
    "created_at": "2017-11-17T19:32:58.760477937Z",
    "model": {
      "id": "@modelID1",
      "name": "@modelName1",
      "created_at": "2016-03-09T17:11:39.608845Z",
      "app_id": "main",
      "output_info": {
        "message": "Show output_info with: GET /models/{model_id}/output_info",
        "type": "concept",
        "type_ext": "concept"
      },
      "model_version": {
        "id": "@modelVersionID1",
        "created_at": "2016-07-13T01:19:12.147644Z",
        "status": {
          "code": 21100,
          "description": "Model trained successfully"
        }
      },
      "display_name": "@modelDisplayName1"
    },
    "input": {
      "id": "@inputID1",
      "data": {
        "image": {
          "url": "@imageUrl1"
        }
      }
    },
    "data": {
      "concepts": [{
        "id": "@conceptID11",
        "name": "@conceptName11",
        "value": 0.99,
        "app_id": "main"
      }, {
        "id": "@conceptID12",
        "name": "@conceptName12",
        "value": 0.98,
        "app_id": "main"
      }]
    }
  },
  {
    "id": "@outputID2",
    "status": {
      "code": 10000,
      "description": "Ok"
    },
    "created_at": "2017-11-17T19:32:58.760477937Z",
    "model": {
      "id": "@modelID2",
      "name": "@modelName2",
      "created_at": "2016-03-09T17:11:39.608845Z",
      "app_id": "main",
      "output_info": {
        "message": "Show output_info with: GET /models/{model_id}/output_info",
        "type": "concept",
        "type_ext": "concept"
      },
      "model_version": {
        "id": "@modelVersionID2",
        "created_at": "2016-07-13T01:19:12.147644Z",
        "status": {
          "code": 21100,
          "description": "Model trained successfully"
        }
      },
      "display_name": "@modelDisplayName2"
    },
    "input": {
      "id": "@inputID2",
      "data": {
        "image": {
          "url": "@imageUrl2"
        }
      }
    },
    "data": {
      "concepts": [{
        "id": "@conceptID21",
        "name": "@conceptName21",
        "value": 0.99,
        "app_id": "main"
      }, {
         "id": "@conceptID22",
         "name": "@conceptName22",
         "value": 0.98,
         "app_id": "main"
      }]
    }
  }]
}
    `));

    app.models.predict('@modelID', ['https://some-image-url1', 'https://some-image-url2'])
      .then(response => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "inputs": [
    {
      "data": {
        "image": {
          "url": "https://some-image-url1"
        }
      }
    },
    {
      "data": {
        "image": {
          "url": "https://some-image-url2"
        }
      }
    }
  ]
}
        `));

        let output1 = response.outputs[0];
        expect(output1.id).toEqual('@outputID1');
        expect(output1.input.id).toEqual('@inputID1');
        expect(output1.data.concepts[0].id).toEqual('@conceptID11');
        expect(output1.data.concepts[1].id).toEqual('@conceptID12');

        let output2 = response.outputs[1];
        expect(output2.id).toEqual('@outputID2');
        expect(output2.input.id).toEqual('@inputID2');
        expect(output2.data.concepts[0].id).toEqual('@conceptID21');
        expect(output2.data.concepts[1].id).toEqual('@conceptID22');

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Batch predicts with arguments', done => {
    mock.onPost(BASE_URL + '/v2/models/%40modelID/outputs').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "outputs": [
    {
      "id": "@outputID1",
      "status": {
        "code": 10000,
        "description": "Ok"
      },
      "created_at": "2019-01-29T16:45:43.793810775Z",
      "model": {
        "id": "aaa03c23b3724a16a56b629203edc62c",
        "name": "general",
        "created_at": "2016-03-09T17:11:39.608845Z",
        "app_id": "main",
        "output_info": {
          "message": "Show output_info with: GET /models/{model_id}/output_info",
          "type": "concept",
          "type_ext": "concept"
        },
        "model_version": {
          "id": "aa9ca48295b37401f8af92ad1af0d91d",
          "created_at": "2016-07-13T01:19:12.147644Z",
          "status": {
            "code": 21100,
            "description": "Model trained successfully"
          },
          "train_stats": {}
        },
        "display_name": "General"
      },
      "input": {
        "id": "@inputID1",
        "data": {
          "image": {
            "url": "https://clarifai.com/developer/static/images/model-samples/celeb-001.jpg"
          }
        }
      },
      "data": {
        "concepts": [
          {
            "id": "@conceptID11",
            "name": "menschen",
            "value": 0.9963381,
            "app_id": "main"
          },
          {
            "id": "@conceptID12",
            "name": "ein",
            "value": 0.9879057,
            "app_id": "main"
          }
        ]
      }
    },
    {
      "id": "@outputID2",
      "status": {
        "code": 10000,
        "description": "Ok"
      },
      "created_at": "2019-01-29T16:45:43.793810775Z",
      "model": {
        "id": "aaa03c23b3724a16a56b629203edc62c",
        "name": "general",
        "created_at": "2016-03-09T17:11:39.608845Z",
        "app_id": "main",
        "output_info": {
          "message": "Show output_info with: GET /models/{model_id}/output_info",
          "type": "concept",
          "type_ext": "concept"
        },
        "model_version": {
          "id": "aa9ca48295b37401f8af92ad1af0d91d",
          "created_at": "2016-07-13T01:19:12.147644Z",
          "status": {
            "code": 21100,
            "description": "Model trained successfully"
          },
          "train_stats": {}
        },
        "display_name": "General"
      },
      "input": {
        "id": "@inputID2",
        "data": {
          "image": {
            "url": "https://clarifai.com/developer/static/images/model-samples/apparel-001.jpg"
          }
        }
      },
      "data": {
        "concepts": [
          {
            "id": "@conceptID21",
            "name": "brillen und kontaktlinsen",
            "value": 0.99984586,
            "app_id": "main"
          },
          {
            "id": "@conceptID22",
            "name": "linse",
            "value": 0.999823,
            "app_id": "main"
          }
        ]
      }
    }
  ]
}
    `));

    app.models.predict('@modelID', ['https://some-image-url1', 'https://some-image-url2'],
        {language: 'de', maxConcepts: 2, minValue: 0.98})
      .then(response => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "inputs": [
    {
      "data": {
        "image": {
          "url": "https://some-image-url1"
        }
      }
    },
    {
      "data": {
        "image": {
          "url": "https://some-image-url2"
        }
      }
    }
  ],
  "model": {
    "output_info": {
      "output_config": {
        "language": "de",
        "max_concepts": 2,
        "min_value": 0.98
      }
    }
  }
}
        `));

        let output1 = response.outputs[0];
        expect(output1.id).toEqual('@outputID1');
        expect(output1.input.id).toEqual('@inputID1');
        expect(output1.data.concepts[0].id).toEqual('@conceptID11');
        expect(output1.data.concepts[1].id).toEqual('@conceptID12');

        let output2 = response.outputs[1];
        expect(output2.id).toEqual('@outputID2');
        expect(output2.input.id).toEqual('@inputID2');
        expect(output2.data.concepts[0].id).toEqual('@conceptID21');
        expect(output2.data.concepts[1].id).toEqual('@conceptID22');

        done();
      })
      .catch(errorHandler.bind(done));
  });

  // To be future-proof against expansion, response objects with unknown fields should be
  // parsed correctly and unknown fields ignored.
  it('Predicts with unknown response fields', done => {
    mock.onPost(BASE_URL + '/v2/models/%40modelID/outputs').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok",
    "unknown_field": "val"
  },
  "outputs": [{
    "id": "@outputID",
    "status": {
      "code": 10000,
      "description": "Ok"
    },
    "created_at": "2017-11-17T19:32:58.760477937Z",
    "model": {
      "id": "@modelID",
      "name": "@modelName",
      "created_at": "2016-03-09T17:11:39.608845Z",
      "app_id": "main",
      "output_info": {
        "message": "Show output_info with: GET /models/{model_id}/output_info",
        "type": "concept",
        "type_ext": "concept",
        "unknown_field": "val"
      },
      "model_version": {
        "id": "@modelVersionID",
        "created_at": "2016-07-13T01:19:12.147644Z",
        "status": {
          "code": 21100,
          "description": "Model trained successfully"
        },
        "unknown_field": "val"
      },
      "display_name": "@modelDisplayName",
      "unknown_field": "val"
    },
    "input": {
      "id": "@inputID",
      "data": {
        "image": {
          "url": "@imageUrl",
          "unknown_field": "val"
        },
        "unknown_field": "val"
      },
      "unknown_field": "val"
    },
    "data": {
      "concepts": [{
        "id": "@conceptID1",
        "name": "@conceptName1",
        "value": 0.99,
        "app_id": "main",
        "unknown_field": "val"
      }, {
        "id": "@conceptID2",
        "name": "@conceptName2",
        "value": 0.98,
        "app_id": "main",
        "unknown_field": "val"
      }],
      "unknown_field": "val"
    },
    "unknown_field": "val"
  }]
}
    `));


    app.models.predict('@modelID', 'https://some-image-url')
      .then(response => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "inputs": [
    {
      "data": {
        "image": {
          "url": "https://some-image-url"
        }
      }
    }
  ]
}
        `));

        let output = response.outputs[0];

        expect(output.id).toEqual('@outputID');
        expect(output.input.id).toEqual('@inputID');
        expect(output.data.concepts[0].id).toEqual('@conceptID1');
        expect(output.model.id).toEqual('@modelID');

        done();
      })
      .catch(errorHandler.bind(done));
  });

});
