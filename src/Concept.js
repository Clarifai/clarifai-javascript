/**
* class representing a concept and its info
* @class
*/
class Concept {
  constructor(_config, data) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.created_at || data.createdAt;
    this.appId = data.app_id || data.appId;
    this.value = null;
    this._config = _config;
    this._rawData = data;
  }
  /**
  * Returns a javascript object with the raw data attributes (from API)
  * @return {object} An object that contains data about concept from api
  */
  toObject() {
    return this._rawData;
  }
};

module.exports = Concept;
