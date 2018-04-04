let Region = require('./Region');

/**
 * A collection of regions.
 * @class
 */
class Regions {
  constructor(_config, rawData = []) {
    this._config = _config;
    this.rawData = rawData;
    rawData.forEach((regionData, index) => {
      this[index] = new Region(this._config, regionData);
    });
    this.length = rawData.length;
  }

  [Symbol.iterator]() {
    let index = -1;
    return {
      next: () => ({ value: this[++index], done: index >= this.length })
    };
  };
}

module.exports = Regions;
