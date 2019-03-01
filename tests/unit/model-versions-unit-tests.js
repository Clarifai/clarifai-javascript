const Clarifai = require('./../../src');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const {errorHandler} = require('../integration/helpers');

let app;

let mock;

const BASE_URL = 'https://api.clarifai.com';

describe('Unit Tests - Model Versions', () => {
  beforeAll(() => {
    app = new Clarifai.App({
      apiKey: process.env.CLARIFAI_API_KEY,
      apiEndpoint: process.env.API_ENDPOINT
    });
  });

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  it('Gets model version', done => {
    mock.onGet(BASE_URL + '/v2/models/%40modelID/versions/@modelVersionID').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "model_version": {
    "id": "@modelVersionID",
    "created_at": "2017-10-31T16:30:31.226185Z",
    "status": {
      "code": 21100,
      "description": "Model trained successfully"
    },
    "active_concept_count": 5,
    "train_stats": {}
  }
}
    `));


    app.models.getVersion('@modelID', '@modelVersionID')
      .then(response => {
        expect(mock.history.get.length).toBe(1);

        expect(response.status.code).toEqual(10000);
        expect(response.model_version.id).toEqual('@modelVersionID');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Gets model versions', done => {
    mock.onGet(BASE_URL + '/v2/models/%40modelID/versions').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "model_versions": [
    {
      "id": "@modelVersionID1",
      "created_at": "2017-10-31T16:30:31.226185Z",
      "status": {
        "code": 21100,
        "description": "Model trained successfully"
      },
      "active_concept_count": 5,
      "train_stats": {}
    },
    {
      "id": "@modelVersionID2",
      "created_at": "2017-05-16T19:20:38.733764Z",
      "status": {
        "code": 21100,
        "description": "Model trained successfully"
      },
      "active_concept_count": 5,
      "train_stats": {}
    }
  ]
}
    `));

    app.models.getVersions('@modelID')
      .then(response => {
        expect(mock.history.get.length).toBe(1);

        expect(response.status.code).toEqual(10000);
        expect(response.model_versions[0].id).toEqual('@modelVersionID1');
        expect(response.model_versions[1].id).toEqual('@modelVersionID2');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Delete model version', done => {
    mock.onDelete(BASE_URL + '/v2/models/%40modelID/versions/@versionID').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  }
}
    `));

    app.models.delete('@modelID', '@versionID').then(response => {
      expect(mock.history.delete.length).toBe(1);

      expect(response.status.code).toEqual(10000);

      done();
    }).catch(errorHandler.bind(done));
  });
});
