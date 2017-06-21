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
    this.value = data.value || null;
    this._config = _config;
    this.rawData = data;
  }
}
;

module.exports = Concept;
