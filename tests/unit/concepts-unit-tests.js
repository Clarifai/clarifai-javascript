const Clarifai = require('./../../src');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const {errorHandler} = require('../integration/helpers');

let app;

let mock;

const BASE_URL = 'https://api.clarifai.com';

describe('Unit Tests - Concepts', () => {
  beforeAll(() => {
    app = new Clarifai.App({
      apiKey: process.env.CLARIFAI_API_KEY,
      apiEndpoint: process.env.API_ENDPOINT
    });
  });

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  it('Creates concepts', done => {
    mock.onPost(BASE_URL + '/v2/concepts').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "concepts": [
    {
      "id": "@conceptID1",
      "name": "@conceptID1",
      "value": 1,
      "created_at": "2019-01-14T16:42:42.210598955Z",
      "language": "en",
      "app_id": "c102e505581f49d2956e3caa2e1a0dc9"
    },
    {
      "id": "@conceptID2",
      "name": "@conceptID2",
      "value": 1,
      "created_at": "2019-01-14T16:42:42.210605836Z",
      "language": "en",
      "app_id": "c102e505581f49d2956e3caa2e1a0dc9"
    }
  ]
}
    `));

    app.concepts.create(['@conceptID1', '@conceptID2'])
      .then(concepts => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "concepts": [
    {
      "id": "@conceptID1"
    },
    {
      "id": "@conceptID2"
    }
  ]
}
        `));

        expect(concepts[0].id).toBe('@conceptID1');
        expect(concepts[1].id).toBe('@conceptID2');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Gets concept', done => {
    mock.onGet(BASE_URL + '/v2/concepts/%40conceptID').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "concept": {
    "id": "@conceptID",
    "name": "@conceptName",
    "created_at": "2017-10-02T11:34:20.419915Z",
    "language": "en",
    "app_id": "@appID"
  }
}
    `));

    app.concepts.get('@conceptID')
      .then(concept => {
        expect(mock.history.get.length).toBe(1);

        expect(concept.id).toBe('@conceptID');
        expect(concept.name).toBe('@conceptName');
        expect(concept.appId).toBe('@appID');

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Lists concepts', done => {
    mock.onGet(BASE_URL + '/v2/concepts').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "concepts": [{
    "id": "@conceptID1",
    "name": "@conceptName1",
    "created_at": "2017-10-15T16:28:28.901994Z",
    "language": "en",
    "app_id": "@appID"
  }, {
    "id": "@conceptID2",
    "name": "@conceptName2",
    "created_at": "2017-10-15T16:26:46.667104Z",
    "language": "en",
    "app_id": "@appID"
  }]
}
    `));

    app.concepts.list()
      .then(concepts => {
        expect(mock.history.get.length).toBe(1);

        let concept1 = concepts[0];
        expect(concept1.id).toBe('@conceptID1');
        expect(concept1.name).toBe('@conceptName1');
        expect(concept1.appId).toBe('@appID');

        let concept2 = concepts[1];
        expect(concept2.id).toBe('@conceptID2');
        expect(concept2.name).toBe('@conceptName2');
        expect(concept2.appId).toBe('@appID');

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Update concept', done => {
    mock.onPatch(BASE_URL + '/v2/concepts').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "concepts": [
    {
      "id": "@conceptID",
      "name": "@newConceptName",
      "value": 1,
      "created_at": "2019-01-15T14:11:43.864812079Z",
      "language": "en",
      "app_id": "@appID"
    }
  ]
}
    `));

    app.concepts.update({id: '@conceptID', name: '@newConceptName'})
      .then(concepts => {
        expect(mock.history.patch.length).toBe(1);
        expect(JSON.parse(mock.history.patch[0].data)).toEqual(JSON.parse(`
{
  "concepts": [
    {
      "id": "@conceptID",
      "name": "@newConceptName"
    }
  ],
  "action": "overwrite"
}
        `));

        expect(concepts[0].id).toBe('@conceptID');
        expect(concepts[0].name).toBe('@newConceptName');
        done();
      })
      .catch(errorHandler.bind(done));
  });
});
