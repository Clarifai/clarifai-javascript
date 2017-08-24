/**
 * class representing a version of a model
 * @class
 */
class ModelVersion {
  constructor(_config, data) {
    this.id = data.id;
    this.created_at = this.createdAt = data.created_at || data.createdAt;
    this.status = data.status;
    this.active_concept_count = data.active_concept_count;
    this.metrics = data.metrics;
    this._config = _config;
    this.rawData = data;
  }
}
;

module.exports = ModelVersion;
