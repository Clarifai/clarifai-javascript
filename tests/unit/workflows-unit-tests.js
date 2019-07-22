const Clarifai = require('./../../src');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const {errorHandler} = require('../integration/helpers');

let app;

let mock;

const BASE_URL = 'https://api.clarifai.com';

describe('Unit Tests - Workflows', () => {
  beforeAll(() => {
    app = new Clarifai.App({
      apiKey: process.env.CLARIFAI_API_KEY,
      apiEndpoint: process.env.API_ENDPOINT
    });
  });

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  it('Lists workflows', done => {
    mock.onGet(BASE_URL + '/v2/workflows').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "workflows": [{
    "id": "@workflowID1",
    "app_id": "@appID1",
    "created_at": "2017-07-10T01:45:05.672880Z"
  },
  {
    "id": "@workflowID2",
    "app_id": "@appID2",
    "created_at": "2017-08-10T01:45:05.672880Z"
  }],
  "results": [
    {
      "status": {
        "code": 10000,
        "description": "Ok"
      },
      "input": {
        "id": "@inputID",
        "data": {
          "image": {
            "url": "@inputURL"
          }
        }
      },
      "outputs": [
        {
          "id": "@outputID1",
          "status": {
            "code": 10000,
            "description": "Ok"
          },
          "created_at": "2017-07-10T12:01:44.929928529Z",
          "model": {
            "id": "d16f390eb32cad478c7ae150069bd2c6",
            "name": "moderation",
            "created_at": "2017-05-12T21:28:00.471607Z",
            "app_id": "main",
            "output_info": {
              "message": "Show output_info with: GET /models/{model_id}/output_info",
              "type": "concept",
              "type_ext": "concept"
            },
            "model_version": {
              "id": "b42ac907ac93483484483a0040a386be",
              "created_at": "2017-05-12T21:28:00.471607Z",
              "status": {
                "code": 21100,
                "description": "Model trained successfully"
              }
            }
          },
          "data": {
            "concepts": [
              {
                "id": "@conceptID11",
                "name": "safe",
                "value": 0.99999714,
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
          "created_at": "2017-07-10T12:01:44.929941126Z",
          "model": {
            "id": "aaa03c23b3724a16a56b629203edc62c",
            "name": "general-v1.3",
            "created_at": "2016-02-26T23:38:40.086101Z",
            "app_id": "main",
            "output_info": {
              "type": "concept",
              "type_ext": "concept"
            },
            "model_version": {
              "id": "aa9ca48295b37401f8af92ad1af0d91d",
              "created_at": "2016-07-13T00:58:55.915745Z",
              "status": {
                "code": 21100,
                "description": "Model trained successfully"
              }
            }
          },
          "data": {
            "concepts": [
              {
                "id": "@conceptID21"
              },
              {
                "id": "@conceptID22"
              }
            ]
          }
        }
      ]
    }
  ]
}
    `));

      app.workflows.list().then(workflows => {
        expect(mock.history.get.length).toBe(1);

        const workflow1 = workflows[0];
        expect(workflow1.id).toBe('@workflowID1');
        expect(workflow1.appId).toBe('@appID1');
        expect(workflow1.createdAt).toBe("2017-07-10T01:45:05.672880Z");

        const workflow2 = workflows[1];
        expect(workflow2.id).toBe('@workflowID2');
        expect(workflow2.appId).toBe('@appID2');
        expect(workflow2.createdAt).toBe("2017-08-10T01:45:05.672880Z");

        done();
      })
        .catch(errorHandler.bind(done));
  });

  it('Creates workflows', done => {
    mock.onPost(BASE_URL + '/v2/workflows').reply(200, JSON.parse(`
    {
      "status": {
        "code": 10000,
        "description": "Ok"
      },
      "workflows": [{
        "id": "@workflowID1",
        "app_id": "@appID1",
        "created_at": "2017-07-10T01:45:05.672880Z"
      },
      {
        "id": "@workflowID2",
        "app_id": "@appID2",
        "created_at": "2017-08-10T01:45:05.672880Z"
      }],
      "results": [
        {
          "status": {
            "code": 10000,
            "description": "Ok"
          },
          "input": {
            "id": "@inputID",
            "data": {
              "image": {
                "url": "@inputURL"
              }
            }
          },
          "outputs": [
            {
              "id": "@outputID1",
              "status": {
                "code": 10000,
                "description": "Ok"
              },
              "created_at": "2017-07-10T12:01:44.929928529Z",
              "model": {
                "id": "d16f390eb32cad478c7ae150069bd2c6",
                "name": "moderation",
                "created_at": "2017-05-12T21:28:00.471607Z",
                "app_id": "main",
                "output_info": {
                  "message": "Show output_info with: GET /models/{model_id}/output_info",
                  "type": "concept",
                  "type_ext": "concept"
                },
                "model_version": {
                  "id": "b42ac907ac93483484483a0040a386be",
                  "created_at": "2017-05-12T21:28:00.471607Z",
                  "status": {
                    "code": 21100,
                    "description": "Model trained successfully"
                  }
                }
              },
              "data": {
                "concepts": [
                  {
                    "id": "@conceptID11",
                    "name": "safe",
                    "value": 0.99999714,
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
              "created_at": "2017-07-10T12:01:44.929941126Z",
              "model": {
                "id": "aaa03c23b3724a16a56b629203edc62c",
                "name": "general-v1.3",
                "created_at": "2016-02-26T23:38:40.086101Z",
                "app_id": "main",
                "output_info": {
                  "type": "concept",
                  "type_ext": "concept"
                },
                "model_version": {
                  "id": "aa9ca48295b37401f8af92ad1af0d91d",
                  "created_at": "2016-07-13T00:58:55.915745Z",
                  "status": {
                    "code": 21100,
                    "description": "Model trained successfully"
                  }
                }
              },
              "data": {
                "concepts": [
                  {
                    "id": "@conceptID21"
                  },
                  {
                    "id": "@conceptID22"
                  }
                ]
              }
            }
          ]
        }
      ]
    }
    `));

      app.workflows.create("@workflowID", 
      {
        "modelId": "@modelID",
        "modelVersionId": "@modelVersionID"
      }
      ).then(workflowid => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "workflows": [{
    "id": "@workflowID",
    "nodes": [{
      "id": "concepts",
      "model": {
      "id": "@modelID",
      "model_version": {
        "id": "@modelVersionID"
      }
    }
  }]
}]
      }
        `));
        expect(workflowid).toBe("@workflowID1");
        done();
      })
        .catch(errorHandler.bind(done));
  });
  
  it('Deletes workflows', done => {
    mock.onDelete(BASE_URL + '/v2/workflows/%40workflowID').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  }
}
    `));

      app.workflows.delete('@workflowID').then(response => {
        expect(mock.history.delete.length).toBe(1);
        expect(response.status.code).toEqual(10000);

        done();
      })
        .catch(errorHandler.bind(done));


  });
  

  it('Workflow predicts', done => {
    mock.onPost(BASE_URL + '/v2/workflows/%40workflowID/results').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "workflow": {
    "id": "@workflowID",
    "app_id": "@appID",
    "created_at": "2017-07-10T01:45:05.672880Z"
  },
  "results": [
    {
      "status": {
        "code": 10000,
        "description": "Ok"
      },
      "input": {
        "id": "@inputID",
        "data": {
          "image": {
            "url": "@inputURL"
          }
        }
      },
      "outputs": [
        {
          "id": "@outputID1",
          "status": {
            "code": 10000,
            "description": "Ok"
          },
          "created_at": "2017-07-10T12:01:44.929928529Z",
          "model": {
            "id": "d16f390eb32cad478c7ae150069bd2c6",
            "name": "moderation",
            "created_at": "2017-05-12T21:28:00.471607Z",
            "app_id": "main",
            "output_info": {
              "message": "Show output_info with: GET /models/{model_id}/output_info",
              "type": "concept",
              "type_ext": "concept"
            },
            "model_version": {
              "id": "b42ac907ac93483484483a0040a386be",
              "created_at": "2017-05-12T21:28:00.471607Z",
              "status": {
                "code": 21100,
                "description": "Model trained successfully"
              }
            }
          },
          "data": {
            "concepts": [
              {
                "id": "@conceptID11",
                "name": "safe",
                "value": 0.99999714,
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
          "created_at": "2017-07-10T12:01:44.929941126Z",
          "model": {
            "id": "aaa03c23b3724a16a56b629203edc62c",
            "name": "general-v1.3",
            "created_at": "2016-02-26T23:38:40.086101Z",
            "app_id": "main",
            "output_info": {
              "message": "Show output_info with: GET /models/{model_id}/output_info",
              "type": "concept",
              "type_ext": "concept"
            },
            "model_version": {
              "id": "aa9ca48295b37401f8af92ad1af0d91d",
              "created_at": "2016-07-13T00:58:55.915745Z",
              "status": {
                "code": 21100,
                "description": "Model trained successfully"
              }
            }
          },
          "data": {
            "concepts": [
              {
                "id": "@conceptID21",
                "name": "train",
                "value": 0.9989112,
                "app_id": "main"
              },
              {
                "id": "@conceptID22",
                "name": "railway",
                "value": 0.9975532,
                "app_id": "main"
              }
            ]
          }
        }
      ]
    }
  ]
}
    `));


    app.workflow.predict("@workflowID", "https://some-image-url")
      .then(response => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "inputs": [
    {
      "id": null,
      "data": {
        "image": {
          "url": "https://some-image-url"
        }
      }
    }
  ]
}
        `));

        expect(response.workflow.id).toEqual('@workflowID');

        let result = response.results[0];
        expect(result.input.id).toEqual('@inputID');

        let output1 = result.outputs[0];
        expect(output1.id).toEqual('@outputID1');
        expect(output1.data.concepts[0].id).toEqual('@conceptID11');

        let output2 = result.outputs[1];
        expect(output2.id).toEqual('@outputID2');
        expect(output2.data.concepts[0].id).toEqual('@conceptID21');
        expect(output2.data.concepts[1].id).toEqual('@conceptID22');

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Workflow batch predicts', done => {
    mock.onPost(BASE_URL + '/v2/workflows/%40workflowID/results').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "workflow": {
    "id": "@workflowID",
    "app_id": "@appID",
    "created_at": "2017-06-15T15:17:30.462323Z"
  },
  "results": [
    {
      "status": {
        "code": 10000,
        "description": "Ok"
      },
      "input": {
        "id": "@inputID1",
        "data": {
          "image": {
            "url": "@url1"
          }
        }
      },
      "outputs": [
        {
          "id": "@outputID11",
          "status": {
            "code": 10000,
            "description": "Ok"
          },
          "created_at": "2019-01-29T17:36:23.736685542Z",
          "model": {
            "id": "@modelID1",
            "name": "food-items-v1.0",
            "created_at": "2016-09-17T22:18:59.955626Z",
            "app_id": "main",
            "output_info": {
              "message": "Show output_info with: GET /models/{model_id}/output_info",
              "type": "concept",
              "type_ext": "concept"
            },
            "model_version": {
              "id": "@modelVersionID1",
              "created_at": "2016-09-17T22:18:59.955626Z",
              "status": {
                "code": 21100,
                "description": "Model trained successfully"
              },
              "train_stats": {}
            },
            "display_name": "Food"
          },
          "data": {}
        },
        {
          "id": "@outputID12",
          "status": {
            "code": 10000,
            "description": "Ok"
          },
          "created_at": "2019-01-29T17:36:23.736712374Z",
          "model": {
            "id": "@modelID2",
            "name": "general",
            "created_at": "2016-03-09T17:11:39.608845Z",
            "app_id": "main",
            "output_info": {
              "message": "Show output_info with: GET /models/{model_id}/output_info",
              "type": "concept",
              "type_ext": "concept"
            },
            "model_version": {
              "id": "@modelVersion2",
              "created_at": "2016-07-13T01:19:12.147644Z",
              "status": {
                "code": 21100,
                "description": "Model trained successfully"
              },
              "train_stats": {}
            },
            "display_name": "General"
          },
          "data": {
            "concepts": [
              {
                "id": "@conceptID11",
                "name": "people",
                "value": 0.9963381,
                "app_id": "main"
              },
              {
                "id": "@conceptID12",
                "name": "one",
                "value": 0.9879056,
                "app_id": "main"
              },
              {
                "id": "@conceptID13",
                "name": "portrait",
                "value": 0.9849082,
                "app_id": "main"
              }
            ]
          }
        }
      ]
    },
    {
      "status": {
        "code": 10000,
        "description": "Ok"
      },
      "input": {
        "id": "@inputID2",
        "data": {
          "image": {
            "url": "@url2"
          }
        }
      },
      "outputs": [
        {
          "id": "@outputID21",
          "status": {
            "code": 10000,
            "description": "Ok"
          },
          "created_at": "2019-01-29T17:36:23.736685542Z",
          "model": {
            "id": "@modelID1",
            "name": "food-items-v1.0",
            "created_at": "2016-09-17T22:18:59.955626Z",
            "app_id": "main",
            "output_info": {
              "message": "Show output_info with: GET /models/{model_id}/output_info",
              "type": "concept",
              "type_ext": "concept"
            },
            "model_version": {
              "id": "@modelVersion1",
              "created_at": "2016-09-17T22:18:59.955626Z",
              "status": {
                "code": 21100,
                "description": "Model trained successfully"
              },
              "train_stats": {}
            },
            "display_name": "Food"
          },
          "data": {
            "concepts": [
              {
                "id": "@concept21",
                "name": "spatula",
                "value": 0.9805687,
                "app_id": "main"
              }
            ]
          }
        },
        {
          "id": "@outputID22",
          "status": {
            "code": 10000,
            "description": "Ok"
          },
          "created_at": "2019-01-29T17:36:23.736712374Z",
          "model": {
            "id": "@modelID2",
            "name": "general",
            "created_at": "2016-03-09T17:11:39.608845Z",
            "app_id": "main",
            "output_info": {
              "message": "Show output_info with: GET /models/{model_id}/output_info",
              "type": "concept",
              "type_ext": "concept"
            },
            "model_version": {
              "id": "@modelVersion2",
              "created_at": "2016-07-13T01:19:12.147644Z",
              "status": {
                "code": 21100,
                "description": "Model trained successfully"
              },
              "train_stats": {}
            },
            "display_name": "General"
          },
          "data": {
            "concepts": [
              {
                "id": "@conceptID31",
                "name": "eyewear",
                "value": 0.99984586,
                "app_id": "main"
              },
              {
                "id": "@conceptID32",
                "name": "lens",
                "value": 0.999823,
                "app_id": "main"
              },
              {
                "id": "@conceptID33",
                "name": "eyeglasses",
                "value": 0.99980056,
                "app_id": "main"
              }
            ]
          }
        }
      ]
    }
  ]
}
    `));


    app.workflow.predict(
        "@workflowID",
        ["https://some-image-url1", "https://some-image-url2"],
        {minValue: 0.98, maxConcepts: 3}
      ).then(response => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "inputs": [
    {
      "id": null,
      "data": {
        "image": {
          "url": "https://some-image-url1"
        }
      }
    },
    {
      "id": null,
      "data": {
        "image": {
          "url": "https://some-image-url2"
        }
      }
    }
  ],
  "output_config": {
    "max_concepts": 3,
    "min_value": 0.98
  }
}
        `));

        expect(response.workflow.id).toEqual('@workflowID');

        let result = response.results[0];
        expect(result.input.id).toEqual('@inputID1');

        let output1 = result.outputs[0];
        expect(output1.id).toEqual('@outputID11');

        let output2 = result.outputs[1];
        expect(output2.id).toEqual('@outputID12');
        expect(output2.data.concepts[0].id).toEqual('@conceptID11');
        expect(output2.data.concepts[1].id).toEqual('@conceptID12');

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Workflow predicts with base64', done => {
    mock.onPost(BASE_URL + '/v2/workflows/%40workflowID/results').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "workflow": {
    "id": "@workflowID",
    "app_id": "@appID",
    "created_at": "2017-06-15T15:17:30.462323Z"
  },
  "results": [
    {
      "status": {
        "code": 10000,
        "description": "Ok"
      },
      "input": {
        "id": "@inputID",
        "data": {
          "image": {
            "base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg=="
          }
        }
      },
      "outputs": [
        {
          "id": "@outputID1",
          "status": {
            "code": 10000,
            "description": "Ok"
          },
          "created_at": "2019-01-20T18:22:36.057985725Z",
          "model": {
            "id": "bd367be194cf45149e75f01d59f77ba7",
            "name": "food-items-v1.0",
            "created_at": "2016-09-17T22:18:59.955626Z",
            "app_id": "main",
            "output_info": {
              "message": "Show output_info with: GET /models/{model_id}/output_info",
              "type": "concept",
              "type_ext": "concept"
            },
            "model_version": {
              "id": "dfebc169854e429086aceb8368662641",
              "created_at": "2016-09-17T22:18:59.955626Z",
              "status": {
                "code": 21100,
                "description": "Model trained successfully"
              },
              "train_stats": {}
            },
            "display_name": "Food"
          },
          "data": {
            "concepts": [
              {
                "id": "@conceptID11",
                "name": "raspberry",
                "value": 0.8684727,
                "app_id": "main"
              },
              {
                "id": "@conceptID12",
                "name": "strawberry",
                "value": 0.7979152,
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
          "created_at": "2019-01-20T18:22:36.058002759Z",
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
          "data": {
            "concepts": [
              {
                "id": "@conceptID21",
                "name": "design",
                "value": 0.9859183,
                "app_id": "main"
              },
              {
                "id": "@conceptID22",
                "name": "art",
                "value": 0.98318106,
                "app_id": "main"
              }
            ]
          }
        }
      ]
    }
  ]
}
    `));


    app.workflow.predict(
        "@workflowID",
        {
          base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg=="
        }
      ).then(response => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "inputs": [
    {
      "id": null,
      "data": {
        "image": {
          "base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg=="
        }
      }
    }
  ]
}
        `));

        expect(response.workflow.id).toEqual('@workflowID');

        let result = response.results[0];
        expect(result.input.id).toEqual('@inputID');

        let output1 = result.outputs[0];
        expect(output1.id).toEqual('@outputID1');
        expect(output1.data.concepts[0].id).toEqual('@conceptID11');

        let output2 = result.outputs[1];
        expect(output2.id).toEqual('@outputID2');
        expect(output2.data.concepts[0].id).toEqual('@conceptID21');
        expect(output2.data.concepts[1].id).toEqual('@conceptID22');

        done();
      })
      .catch(errorHandler.bind(done));
  });

});
