const Clarifai = require('./../../src');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const {errorHandler} = require('../integration/helpers');

let app;

let mock;

const BASE_URL = 'https://api.clarifai.com';

describe('Unit Tests - Models', () => {
  beforeAll(() => {
    app = new Clarifai.App({
      apiKey: process.env.CLARIFAI_API_KEY,
      apiEndpoint: process.env.API_ENDPOINT
    });
  });

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  it('Creates model', done => {
    mock.onPost(BASE_URL + '/v2/models').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "model": {
    "id": "@modelID",
    "name": "@modelName",
    "created_at": "2019-01-22T11:54:12.375436048Z",
    "app_id": "@appID",
    "output_info": {
      "output_config": {
        "concepts_mutually_exclusive": false,
        "closed_environment": false,
        "max_concepts": 0,
        "min_value": 0
      },
      "message": "Show output_info with: GET /models/{model_id}/output_info",
      "type": "concept",
      "type_ext": "concept"
    },
    "model_version": {
      "id": "@modelVersionID",
      "created_at": "2019-01-22T11:54:12.406406642Z",
      "status": {
        "code": 21102,
        "description": "Model not yet trained"
      },
      "active_concept_count": 2,
      "train_stats": {}
    }
  }
}
    `));


    app.models.create({id: '@modelID', name: '@modelName'}, [
      {
        id: 'dog'
      },
      {
        id: 'cat'
      }
    ])
      .then(model => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "model": {
    "id": "@modelID",
    "name": "@modelName",
    "output_info": {
      "data": {
        "concepts": [
          {
            "id": "dog"
          },
          {
            "id": "cat"
          }
        ]
      },
      "output_config": {
        "concepts_mutually_exclusive": false, 
        "closed_environment": false
      }
    }
  }
} 
        `));

        expect(model.id).toBe('@modelID');
        expect(model.name).toBe('@modelName');
        expect(model.modelVersion.id).toBe('@modelVersionID');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Gets model', done => {
    mock.onGet(BASE_URL + '/v2/models/%40modelID').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "model": {
    "id": "@modelID",
    "name": "@modelName",
    "created_at": "2017-05-16T19:20:38.733764Z",
    "app_id": "main",
    "output_info": {
      "data": {
        "concepts": [{
          "id": "@conceptID11",
          "name": "safe",
          "created_at": "2017-05-16T19:20:38.450157Z",
          "language": "en",
          "app_id": "main"
        }]
      },
      "type": "concept",
      "type_ext": "concept"
    },
    "model_version": {
      "id": "@modelVersionID",
      "created_at": "2017-05-16T19:20:38.733764Z",
      "status": {
        "code": 21100,
        "description": "Model trained successfully"
      },
      "active_concept_count": 5
    },
    "display_name": "Moderation"
  }
}
    `));

    app.models.get('@modelID').then(model => {
        expect(mock.history.get.length).toBe(1);

        expect(model.id).toBe('@modelID');
        expect(model.name).toBe('@modelName');
        expect(model.modelVersion.id).toBe('@modelVersionID');
        expect(model.outputInfo.data.concepts[0].id).toBe('@conceptID11');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Gets models', done => {
    mock.onGet(BASE_URL + '/v2/models').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
      "description": "Ok"
    },
  "models": [
    {
      "id": "@modelID1",
      "name": "@modelName1",
      "created_at": "2019-01-16T23:33:46.605294Z",
      "app_id": "main",
      "output_info": {
        "message": "Show output_info with: GET /models/{model_id}/output_info",
        "type": "facedetect",
        "type_ext": "facedetect"
      },
      "model_version": {
        "id": "28b2ff6148684aa2b18a34cd004b4fac",
        "created_at": "2019-01-16T23:33:46.605294Z",
        "status": {
          "code": 21100,
          "description": "Model trained successfully"
        },
        "train_stats": {}
      },
      "display_name": "Face Detection"
    },
    {
      "id": "@modelID2",
      "name": "@modelName2",
      "created_at": "2019-01-16T23:33:46.605294Z",
      "app_id": "main",
      "output_info": {
        "message": "Show output_info with: GET /models/{model_id}/output_info",
        "type": "embed",
        "type_ext": "detect-embed"
      },
      "model_version": {
        "id": "fc6999e5eb274dfdba826f6b1c7ffdab",
        "created_at": "2019-01-16T23:33:46.605294Z",
        "status": {
          "code": 21100,
          "description": "Model trained successfully"
        },
        "train_stats": {}
      },
      "display_name": "Face Embedding"
    }
  ]
}
    `));

    app.models.list().then(models => {
      expect(mock.history.get.length).toBe(1);

      const model1 = models[0];
      expect(model1.id).toBe('@modelID1');
      expect(model1.name).toBe('@modelName1');
      expect(model1.outputInfo.type_ext).toBe('facedetect');

      const model2 = models[1];
      expect(model2.id).toBe('@modelID2');
      expect(model2.name).toBe('@modelName2');
      expect(model2.outputInfo.type_ext).toBe('detect-embed');

      done();
    })
      .catch(errorHandler.bind(done));
  });

  it('Get model outputinfo', done => {
    mock.onGet(BASE_URL + '/v2/models/%40modelID/output_info').reply(200, JSON.parse(`
    {
      "status": {
        "code": 10000,
        "description": "Ok"
      },
      "model": {
        "id": "@modelID",
        "name": "@modelName",
        "created_at": "2017-05-16T19:20:38.733764Z",
        "app_id": "main",
        "output_info": {
          "data": {
            "concepts": [{
              "id": "@conceptID11",
              "name": "safe",
              "created_at": "2017-05-16T19:20:38.450157Z",
              "language": "en",
              "app_id": "main"
            }]
          },
          "type": "concept",
          "type_ext": "concept"
        },
        "model_version": {
          "id": "@modelVersionID",
          "created_at": "2017-05-16T19:20:38.733764Z",
          "status": {
            "code": 21100,
            "description": "Model trained successfully"
          },
          "active_concept_count": 5
        },
        "display_name": "Moderation"
      }
    }
        `));

        app.models.getOutputInfo('@modelID')
        .then(outputinfo => {
          expect(mock.history.get.length).toBe(1);

          expect(outputinfo.id).toBe("@modelID");
          expect(outputinfo.name).toBe("@modelName");
          expect(outputinfo.modelVersion.id).toBe("@modelVersionID");
          expect(outputinfo.outputInfo.type).toBe("concept");
          done();
        })
        .catch(errorHandler.bind(done));
      });

  it('Gets model', done => {
    mock.onGet(BASE_URL + '/v2/models/%40modelID').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "model": {
    "id": "@modelID",
    "name": "@modelName",
    "created_at": "2017-05-16T19:20:38.733764Z",
    "app_id": "main",
    "output_info": {
      "data": {
        "concepts": [{
          "id": "@conceptID11",
          "name": "safe",
          "created_at": "2017-05-16T19:20:38.450157Z",
          "language": "en",
          "app_id": "main"
        }]
      },
      "type": "concept",
      "type_ext": "concept"
    },
    "model_version": {
      "id": "@modelVersionID",
      "created_at": "2017-05-16T19:20:38.733764Z",
      "status": {
        "code": 21100,
        "description": "Model trained successfully"
      },
      "active_concept_count": 5
    },
    "display_name": "Moderation"
  }
}
    `));

    app.models.get('@modelID').then(model => {
        expect(mock.history.get.length).toBe(1);
  
        expect(model.id).toBe('@modelID');
        expect(model.name).toBe('@modelName');
        expect(model.modelVersion.id).toBe('@modelVersionID');
        expect(model.outputInfo.data.concepts[0].id).toBe('@conceptID11');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Modifies models', done => {
    mock.onPatch(BASE_URL + '/v2/models').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "models": [{
    "id": "@modelID",
    "name": "@newModelName",
    "created_at": "2017-11-27T08:35:13.911899Z",
    "app_id": "@appID",
    "output_info": {
      "output_config": {
        "concepts_mutually_exclusive": true,
        "closed_environment": true
      },
      "message": "Show output_info with: GET /models/{model_id}/output_info",
      "type": "concept",
      "type_ext": "concept"
    },
    "model_version": {
      "id": "@modelVersionID",
      "created_at": "2017-11-27T08:35:14.298376733Z",
      "status": {
        "code": 21102,
        "description": "Model not yet trained"
      }
    }
  }]
}
    `));

    app.models.update({
      id: '@modelID',
      name: '@newModelName',
      conceptsMutuallyExclusive: true,
      closedEnvironment: true,
      concepts: [{id: '@conceptID1'}],
      action: 'merge',
    }).then(models => {
      expect(mock.history.patch.length).toBe(1);
      expect(JSON.parse(mock.history.patch[0].data)).toEqual(JSON.parse(`
{
  "models": [
    {
      "id": "@modelID",
      "name": "@newModelName",
      "output_info": {
        "data": {
          "concepts": [
            {
              "id": "@conceptID1"
            }
          ]
        },
        "output_config": {
          "concepts_mutually_exclusive": true,
          "closed_environment": true
        }
      }
    }
  ],
  "action": "merge"
}
        `));

      let model = models[0];
      expect(model.id).toEqual('@modelID');
      expect(model.name).toEqual('@newModelName');

      done();
    }).catch(errorHandler.bind(done));
  });

  it('Trains model', done => {
    mock.onPost(BASE_URL + '/v2/models/%40modelID/versions').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "model": {
    "id": "@modelID",
    "name": "@modelName",
    "created_at": "2019-01-20T15:51:21.641006Z",
    "app_id": "@appID",
    "output_info": {
      "output_config": {
        "concepts_mutually_exclusive": false,
        "closed_environment": false,
        "max_concepts": 0,
        "min_value": 0
      },
      "message": "Show output_info with: GET /models/{model_id}/output_info",
      "type": "concept",
      "type_ext": "concept"
    },
    "model_version": {
      "id": "@modelVersionID",
      "created_at": "2019-01-20T15:51:25.093744401Z",
      "status": {
        "code": 21103,
        "description": "Custom model is currently in queue for training, waiting on inputs to process."
      },
      "active_concept_count": 2,
      "train_stats": {}
    }
  }
}
    `));

    app.models.train('@modelID').then(model => {
      expect(mock.history.post.length).toBe(1);

      expect(model.id).toEqual('@modelID');
      expect(model.name).toEqual('@modelName');

      done();
    }).catch(errorHandler.bind(done));
  });

  it('Deletes all models', done => {
    mock.onDelete(BASE_URL + '/v2/models').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  }
}
    `));

    app.models.delete().then(response => {
      expect(mock.history.delete.length).toBe(1);
      expect(JSON.parse(mock.history.delete[0].data)).toEqual(JSON.parse(`
{
  "delete_all": true
}
        `));

      expect(response.status.code).toEqual(10000);

      done();
    }).catch(errorHandler.bind(done));
  });

  it('Delete model', done => {
    mock.onDelete(BASE_URL + '/v2/models/%40modelID').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  }
}
    `));

    app.models.delete('@modelID').then(response => {
      expect(mock.history.delete.length).toBe(1);

      expect(response.status.code).toEqual(10000);

      done();
    }).catch(errorHandler.bind(done));
  });
});
