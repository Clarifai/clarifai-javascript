const Clarifai = require('./../../src');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const {errorHandler} = require('../integration/helpers');

let app;

let mock;

const BASE_URL = 'https://api.clarifai.com';

describe('Unit Tests - Model Search', () => {
  beforeAll(() => {
    app = new Clarifai.App({
      apiKey: process.env.CLARIFAI_API_KEY,
      apiEndpoint: process.env.API_ENDPOINT
    });
  });

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  it('Search models by name', done => {
    mock.onPost(BASE_URL + '/v2/models/searches').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "models": [{
    "id": "@modelID",
    "name": "celeb-v1.3",
    "created_at": "2016-10-25T19:30:38.541073Z",
    "app_id": "main",
    "output_info": {
      "message": "Show output_info with: GET /models/{model_id}/output_info",
      "type": "concept",
      "type_ext": "facedetect-identity"
    },
    "model_version": {
      "id": "@modelVersionID",
      "created_at": "2016-10-25T19:30:38.541073Z",
      "status": {
        "code": 21100,
        "description": "Model trained successfully"
      },
      "active_concept_count": 10554
    },
    "display_name": "Celebrity"
  }]
}
    `));


    app.models.search("celeb*")
      .then(models => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "model_query": {
    "name": "celeb*",
    "type": null
  }
}
        `));

        expect(models[0].id).toEqual('@modelID');
        expect(models[0].modelVersion.id).toEqual('@modelVersionID');

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Search models by name and type', done => {
    mock.onPost(BASE_URL + '/v2/models/searches').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "models": [{
    "id": "@modelID",
    "name": "focus",
    "created_at": "2017-03-06T22:57:00.660603Z",
    "app_id": "main",
    "output_info": {
      "message": "Show output_info with: GET /models/{model_id}/output_info",
      "type": "blur",
      "type_ext": "focus"
    },
    "model_version": {
      "id": "@modelVersionID",
      "created_at": "2017-03-06T22:57:00.684652Z",
      "status": {
        "code": 21100,
        "description": "Model trained successfully"
      }
    },
    "display_name": "Focus"
  }]
}
    `));


    app.models.search("*", "focus")
      .then(models => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "model_query": {
    "name": "*",
    "type": "focus"
  }
}
        `));

        expect(models[0].id).toEqual('@modelID');
        expect(models[0].modelVersion.id).toEqual('@modelVersionID');

        done();
      })
      .catch(errorHandler.bind(done));
  });

});
