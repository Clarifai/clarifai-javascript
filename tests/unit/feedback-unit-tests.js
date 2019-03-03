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

  it('Model feedback', done => {
    mock.onPost(BASE_URL + '/v2/models/%40modelID/feedback').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  }
}
    `));

    app.models.feedback('@modelID', 'https://some-image-url', {
        id: '@inputID',
        data: {
          concepts: [
            {'id': 'dog', 'value': true},
            {'id': 'cat', 'value': false}
          ],
          regions: [
            {
              region_info: {
                bounding_box: {
                  top_row: 0.1,
                  left_col: 0.1,
                  bottom_row: 0.2,
                  right_col: 0.2
                },
                feedback: "not_detected"
              },
              data: {
                concepts: [
                  {
                    id: "freeman"
                  },
                  {
                    id: "eminem",
                    value: 0
                  }
                ]
              }
            }
          ]
        },
        info: {
          'endUserId': '@endUserID',
          'sessionId': '@sessionID',
          'event_type': 'annotation',
          'outputId': '@outputID'
        }
      })
      .then(response => {
        expect(mock.history.post.length).toBe(1);

        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "input": {
    "id": "@inputID",
    "data": {
      "image": {
        "url": "https://some-image-url"
      },
      "concepts": [
        {
          "id": "dog",
          "value": true
        },
        {
          "id": "cat",
          "value": false
        }
      ],
      "regions": [
        {
          "region_info": {
            "bounding_box": {
              "top_row": 0.1,
              "left_col": 0.1,
              "bottom_row": 0.2,
              "right_col": 0.2
            },
            "feedback": "not_detected"
          },
          "data": {
            "concepts": [
              {
                "id": "freeman"
              },
              {
                "id": "eminem",
                "value": 0
              }
            ]
          }
        }
      ]
    },
    "feedback_info": {
      "end_user_id": "@endUserID",
      "session_id": "@sessionID",
      "event_type": "annotation",
      "output_id": "@outputID"
    }
  }
}
        `));

        expect(response.status.code).toBe(10000);

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Searches feedback', done => {
    mock.onPost(BASE_URL + '/v2/searches/feedback').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  }
}
    `));

    app.inputs.searchFeedback('@inputID', '@searchID', '@endUserID', '@sessionID')
      .then(response => {
        expect(mock.history.post.length).toBe(1);

        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "input": {
    "id": "@inputID",
    "feedback_info": {
      "event_type":   "search_click",
      "search_id":    "@searchID",
      "end_user_id":  "@endUserID",
      "session_id":   "@sessionID"
    }
  }
}
        `));

        expect(response.status.code).toBe(10000);

        done();
      })
      .catch(errorHandler.bind(done));
  });
});
