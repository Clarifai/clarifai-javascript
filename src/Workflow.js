let axios = require('axios');
let {API, replaceVars} = require('./constants');
let {WORKFLOWS_PATH, WORKFLOW_PATH, WORKFLOW_RESULTS_PATH} = API;
let {wrapToken, formatInput} = require('./utils');
let {checkType} = require('./helpers');

/**
 * class representing a workflow
 * @class
 */
class Workflow {
  constructor(_config, rawData=[]) {
    this._config = _config;
    this.rawData = rawData;
  }

  create(workflowId, config) {
    const url = `${this._config.basePath}${WORKFLOWS_PATH}`;
    const modelId = config.modelId;
    const modelVersionId = config.modelVersionId;
    const body = {
      workflows: [{
        id: workflowId,
        nodes: [{
          id: 'concepts',
          model: {
            id: modelId,
            model_version: {
              id: modelVersionId
            }
          }
        }]
      }]
    };

    return wrapToken(this._config, (headers) => {
      return new Promise((resolve, reject) => {
        axios.post(url, body, {
          headers
        }).then(response => {
          const workflowId = response.data.workflows[0].id;
          resolve(workflowId);
        }, reject);
      });
    });
  }

  delete(workflowId, config) {
    const url = `${this._config.basePath}${replaceVars(WORKFLOW_PATH, [workflowId])}`;
    return wrapToken(this._config, (headers) => {
      return new Promise((resolve, reject) => {
        axios.delete(url, {
          headers
        }).then(response => {
          const data = response.data;
          resolve(data);
        }, reject);
      });
    });
  }

  /**
   * Returns workflow output according to inputs
   * @param {string}                   workflowId    Workflow id
   * @param {object[]|object|string}   inputs    An array of objects/object/string pointing to an image resource. A string can either be a url or base64 image bytes. Object keys explained below:
   *    @param {object}                  inputs[].image     Object with keys explained below:
   *       @param {string}                 inputs[].image.(url|base64)  Can be a publicly accessibly url or base64 string representing image bytes (required)
   */
  predict(workflowId, inputs) {
    const url = `${this._config.basePath}${replaceVars(WORKFLOW_RESULTS_PATH, [workflowId])}`;
    if (checkType(/(Object|String)/, inputs)) {
      inputs = [inputs];
    }
    return wrapToken(this._config, (headers) => {
      const params = {
        inputs: inputs.map(formatInput)
      };
      return new Promise((resolve, reject) => {
        axios.post(url, params, {
          headers
        }).then((response) => {
          const data = response.data;
          resolve(data);
        }, reject);
      });
    });
  }
}

module.exports = Workflow;