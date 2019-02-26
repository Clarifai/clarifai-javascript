const Clarifai = require('./../../src');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const {errorHandler} = require('../integration/helpers');

let app;

let mock;

const BASE_URL = 'https://api.clarifai.com';

describe('Unit Tests - Concept Search', () => {
  beforeAll(() => {
    app = new Clarifai.App({
      apiKey: process.env.CLARIFAI_API_KEY,
      apiEndpoint: process.env.API_ENDPOINT
    });
  });

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  it('Searches concepts', done => {
    mock.onPost(BASE_URL + '/v2/concepts/searches').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "concepts": [
    {
      "id": "@conceptID1",
      "name": "concealer",
      "value": 1,
      "created_at": "2016-03-17T11:43:01.223962Z",
      "language": "en",
      "app_id": "main",
      "definition": "concealer"
    },
    {
      "id": "@conceptID2",
      "name": "concentrate",
      "value": 1,
      "created_at": "2016-03-17T11:43:01.223962Z",
      "language": "en",
      "app_id": "main",
      "definition": "direct one's attention on something"
    }
  ]
}
    `));


    app.concepts.search('conc*')
      .then(concepts => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "concept_query": {
    "name": "conc*",
    "language": null
  }
}
        `));

        expect(concepts[0].id).toEqual('@conceptID1');
        expect(concepts[0].name).toEqual('concealer');

        expect(concepts[1].id).toEqual('@conceptID2');
        expect(concepts[1].name).toEqual('concentrate');

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Searches concepts with language', done => {
    mock.onPost(BASE_URL + '/v2/concepts/searches').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "concepts": [
    {
      "id": "@conceptID1",
      "name": "狗",
      "value": 1,
      "created_at": "2016-03-17T11:43:01.223962Z",
      "language": "zh",
      "app_id": "main"
    },
    {
      "id": "@conceptID2",
      "name": "狗仔队",
      "value": 1,
      "created_at": "2016-03-17T11:43:01.223962Z",
      "language": "zh",
      "app_id": "main"
    },
    {
      "id": "@conceptID3",
      "name": "狗窝",
      "value": 1,
      "created_at": "2016-03-17T11:43:01.223962Z",
      "language": "zh",
      "app_id": "main"
    }
  ]
}
    `));


    app.concepts.search('狗*', 'zh')
      .then(concepts => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "concept_query": {
    "name": "狗*",
    "language": "zh"
  }
}
        `));

        expect(concepts[0].id).toEqual('@conceptID1');
        expect(concepts[0].name).toEqual('狗');

        expect(concepts[1].id).toEqual('@conceptID2');
        expect(concepts[1].name).toEqual('狗仔队');

        expect(concepts[2].id).toEqual('@conceptID3');
        expect(concepts[2].name).toEqual('狗窝');

        done();
      })
      .catch(errorHandler.bind(done));
  });
});
