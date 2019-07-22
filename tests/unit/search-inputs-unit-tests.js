const Clarifai = require('./../../src');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const {errorHandler} = require('../integration/helpers');

let app;

let mock;

const BASE_URL = 'https://api.clarifai.com';

describe('Unit Tests - Input Search', () => {
  beforeAll(() => {
    app = new Clarifai.App({
      apiKey: process.env.CLARIFAI_API_KEY,
      apiEndpoint: process.env.API_ENDPOINT
    });
  });

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  it('Search inputs by concept ID', done => {
    mock.onPost(BASE_URL + '/v2/searches').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "hits": [
    {
      "score": 0.99,
      "input": {
        "id": "@inputID",
        "created_at": "2016-11-22T17:06:02Z",
        "data": {
          "image": {
            "url": "@inputURL"
          }
        },
        "status": {
          "code": 30000,
          "description": "Download complete"
        }
      }
    }
  ]
}
    `));


    app.inputs.search({concept: {id: '@conceptID'}})
      .then(response => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "query": {
    "ands": [
      {
        "output": {
          "data": {
            "concepts": [
              {
                "id": "@conceptID"
              }
            ]
          }
        }
      }
    ]
  },
  "pagination": { 
    "page": 1, 
    "per_page": 20 
  } 
}
        `));

        expect(response.hits[0].score).toEqual(0.99);
        expect(response.hits[0].input.id).toEqual('@inputID');
        expect(response.hits[0].input.data.image.url).toEqual('@inputURL');

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Search inputs by concept name', done => {
    mock.onPost(BASE_URL + '/v2/searches').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "hits": [
    {
      "score": 0.99,
      "input": {
        "id": "@inputID",
        "created_at": "2016-11-22T17:06:02Z",
        "data": {
          "image": {
            "url": "@inputURL"
          }
        },
        "status": {
          "code": 30000,
          "description": "Download complete"
        }
      }
    }
  ]
}
    `));

    app.inputs.search({concept: {name: '@conceptName'}})
      .then(response => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "query": {
    "ands": [
      {
        "output": {
          "data": {
            "concepts": [
              {
                "name": "@conceptName"
              }
            ]
          }
        }
      }
    ]
  },
  "pagination": { 
    "page": 1, 
    "per_page": 20 
  }
}
        `));

        expect(response.hits[0].score).toEqual(0.99);
        expect(response.hits[0].input.id).toEqual('@inputID');
        expect(response.hits[0].input.data.image.url).toEqual('@inputURL');

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Search inputs by geo location', done => {
    mock.onPost(BASE_URL + '/v2/searches').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "hits": [
    {
      "score": 0.99,
      "input": {
        "id": "@inputID",
        "created_at": "2016-11-22T17:06:02Z",
        "data": {
          "image": {
            "url": "@inputURL"
          }
        },
        "status": {
          "code": 30000,
          "description": "Download complete"
        }
      }
    }
  ]
}
    `));

    app.inputs.search({input: {geo: {longitude: 1.5, latitude: -1, type: 'withinKilometers', value: 1}}})
      .then(response => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "query": {
    "ands": [
      {
        "input": {
          "data": {
            "geo": {
              "geo_point": {
                "longitude": 1.5,
                "latitude": -1
              },
              "geo_limit": {
                "type": "withinKilometers",
                "value": 1
              }
            }
          }
        }
      }
    ]
  },
  "pagination": { 
    "page": 1, 
    "per_page": 20 
  }
}
        `));

        expect(response.hits[0].score).toEqual(0.99);
        expect(response.hits[0].input.id).toEqual('@inputID');
        expect(response.hits[0].input.data.image.url).toEqual('@inputURL');

        done();
      })
      .catch(errorHandler.bind(done));
  });
});
