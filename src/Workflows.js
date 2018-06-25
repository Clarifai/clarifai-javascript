let axios = require('axios');
let Workflow = require('./Workflow');
let {API, replaceVars} = require('./constants');
let {WORKFLOWS_PATH, WORKFLOW_PATH,} = API;
let {wrapToken,} = require('./utils');
let {isSuccess,} = require('./helpers');

/**
 * class representing a collection of workflows
 * @class
 */
class Workflows {
  constructor(_config, rawData = []) {
    this._config = _config;
    this.rawData = rawData;
    rawData.forEach((workflowData, index) => {
      this[index] = new Workflow(this._config, workflowData);
    });
    this.length = rawData.length;
  }

  /**
   * Get all workflows in app
   * @param {Object}    options  Object with keys explained below: (optional)
   *   @param {Number}    options.page  The page number (optional, default: 1)
   *   @param {Number}    options.perPage  Number of images to return per page (optional, default: 20)
   * @return {Promise(Workflows, error)} A Promise that is fulfilled with an instance of Workflows or rejected with an error
   */
  list(options = {page: 1, perPage: 20}) {
    let url = `${this._config.basePath}${WORKFLOWS_PATH}`;
    return wrapToken(this._config, (headers) => {
      return new Promise((resolve, reject) => {
        axios.get(url, {
          headers,
          params: {
            page: options.page,
            per_page: options.perPage,
          }
        }).then((response) => {
          if (isSuccess(response)) {
            resolve(new Workflows(this._config, response.data.workflows));
          } else {
            reject(response);
          }
        }, reject);
      });
    });
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

  delete(workflowId) {
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
}
;

module.exports = Workflows;
