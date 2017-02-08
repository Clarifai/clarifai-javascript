const MAX_BATCH_SIZE = 128;
const GEO_LIMIT_TYPES = ['withinMiles', 'withinKilometers', 'withinRadians', 'withinDegrees'];
const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;
const SYNC_TIMEOUT = 60000;
const MODEL_QUEUED_FOR_TRAINING = '21103';
const MODEL_TRAINING = '21101';
const POLLTIME = 2000;

module.exports = {
  API: {
    TOKEN_PATH: '/v2/token',
    MODELS_PATH: '/v2/models',
    MODEL_PATH: '/v2/models/$0',
    MODEL_VERSIONS_PATH: '/v2/models/$0/versions',
    MODEL_VERSION_PATH: '/v2/models/$0/versions/$1',
    MODEL_PATCH_PATH: '/v2/models/$0/output_info/data/concepts',
    MODEL_OUTPUT_PATH: '/v2/models/$0/output_info',
    MODEL_SEARCH_PATH: '/v2/models/searches',
    PREDICT_PATH: '/v2/models/$0/outputs',
    VERSION_PREDICT_PATH: '/v2/models/$0/versions/$1/outputs',
    CONCEPTS_PATH: '/v2/concepts',
    CONCEPT_PATH: '/v2/concepts/$0',
    CONCEPT_SEARCH_PATH: '/v2/concepts/searches',
    MODEL_INPUTS_PATH: '/v2/models/$0/inputs',
    MODEL_VERSION_INPUTS_PATH: '/v2/models/$0/versions/$1/inputs',
    INPUTS_PATH: '/v2/inputs',
    INPUT_PATH: '/v2/inputs/$0',
    INPUTS_STATUS_PATH: '/v2/inputs/status',
    SEARCH_PATH: '/v2/searches'
  },
  ERRORS: {
    paramsRequired: (param) => {
      let paramList = Array.isArray(param) ? param: [param];
      return new Error(`The following ${paramList.length > 1? 'params are': 'param is'} required: ${paramList.join(', ')}`);
    },
    MAX_INPUTS: new Error(`Number of inputs passed exceeded max of ${MAX_BATCH_SIZE}`),
    INVALID_GEOLIMIT_TYPE: new Error(`Incorrect geo_limit type. Value must be any of the following: ${GEO_LIMIT_TYPES.join(', ')}`),
    INVALID_DELETE_ARGS: new Error(`Wrong arguments passed. You can only delete all models (provide no arguments), delete select models (provide list of ids),
    delete a single model (providing a single id) or delete a model version (provide a single id and version id)`)
  },
  STATUS: {
    MODEL_QUEUED_FOR_TRAINING,
    MODEL_TRAINING
  },
  // var replacement must be given in order
  replaceVars: (path, vars=[])=> {
    let newPath = path;
    vars.forEach((val, index)=> {
      if (index === 0) {
        val = encodeURIComponent(val);
      }
      newPath = newPath.replace(new RegExp(`\\$${index}`, 'g'), val);
    });
    return newPath;
  },
  GEO_LIMIT_TYPES,
  MAX_BATCH_SIZE,
  URL_REGEX,
  SYNC_TIMEOUT,
  POLLTIME
};
