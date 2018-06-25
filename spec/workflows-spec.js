const Clarifai = require('./../src');
const {errorHandler} = require('./helpers');
const {sampleImages} = require('./test-data');
const generalModelVersionId = 'aa9ca48295b37401f8af92ad1af0d91d';
const Workflows = require('./../src/Workflows');

let app;
let testWorkflowId;

describe('Workflow', () => {
  beforeAll(function() {
    app = new Clarifai.App({
      apiKey: process.env.CLARIFAI_API_KEY,
      apiEndpoint: process.env.API_ENDPOINT
    });
  });

  it('Gets all workflows', done => {
    app.workflows.list({
      page: 1,
      perPage: 5
    })
      .then(workflows => {
        expect(workflows).toBeDefined();
        expect(workflows instanceof Workflows).toBe(true);

        for (let i = 0; i < workflows.length; i++) {
          let workflow = workflows[i];
          expect(workflow.id).toBeDefined();
          expect(workflow.appId).toBeDefined();
          expect(workflow.createdAt).toBeDefined();
        }

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Call given workflow id with one input', done => {
    testWorkflowId = 'big-bang' + Date.now();
    app.workflows.create(testWorkflowId, {
      modelId: Clarifai.GENERAL_MODEL,
      modelVersionId: generalModelVersionId
    })
      .then(workflowId => {
        return app.workflow.predict(workflowId, sampleImages[0]);
      })
      .then(response => {
        expect(response.workflow).toBeDefined();
        const result = response.results[0];
        const input = result.input;
        expect(input.id).toBeDefined();
        expect(input.data).toBeDefined();
        const outputs = result.outputs;
        const output = outputs[0];
        expect(output.id).toBeDefined();
        expect(output.status).toBeDefined();
        expect(output.created_at).toBeDefined();
        expect(output.model).toBeDefined();
        expect(output.model.model_version).toBeDefined();
      })
      .then(() => {
        app.workflows.delete(testWorkflowId);
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Call given workflow id with multiple inputs with specified types', done => {
    testWorkflowId = 'big-bang' + Date.now();
    app.workflows.create(testWorkflowId, {
      modelId: Clarifai.GENERAL_MODEL,
      modelVersionId: generalModelVersionId
    })
      .then(() => {
        return app.workflow.predict(testWorkflowId, [
          {
            url: sampleImages[0],
            allowDuplicateUrl: true
          },
          {
            url: sampleImages[1],
            allowDuplicateUrl: true
          }
        ]);
      })
      .then(response => {
        expect(response.workflow).toBeDefined();
        const results = response.results;
        expect(results.length).toBe(2);
        const result = results[0];
        const input = result.input;
        expect(input.id).toBeDefined();
        expect(input.data).toBeDefined();
        const output = result.outputs[0];
        expect(output.id).toBeDefined();
        expect(output.status).toBeDefined();
        expect(output.created_at).toBeDefined();
        expect(output.model).toBeDefined();
        expect(output.model.model_version).toBeDefined();
      })
      .then(() => {
        app.workflows.delete(testWorkflowId);
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Call given workflow id with multiple inputs without specified types', done => {
    testWorkflowId = 'big-bang' + Date.now();
    app.workflows.create(testWorkflowId, {
      modelId: Clarifai.GENERAL_MODEL,
      modelVersionId: generalModelVersionId
    })
      .then(() => {
        return app.workflow.predict(testWorkflowId, [
          sampleImages[2], sampleImages[3]
        ]);
      })
      .then(response => {
        expect(response.workflow).toBeDefined();
        const results = response.results;
        expect(results.length).toBe(2);
        const result = results[0];
        const input = result.input;
        expect(input.id).toBeDefined();
        expect(input.data).toBeDefined();
        const output = result.outputs[0];
        expect(output.id).toBeDefined();
        expect(output.status).toBeDefined();
        expect(output.created_at).toBeDefined();
        expect(output.model).toBeDefined();
        expect(output.model.model_version).toBeDefined();
        return app.workflow.delete(testWorkflowId);
      })
      .then(() => {
        app.workflows.delete(testWorkflowId);
        done();
      })
      .catch(errorHandler.bind(done));
  });
});
