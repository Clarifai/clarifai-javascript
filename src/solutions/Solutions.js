let Moderation = require('./Moderation');

class Solutions {

  constructor(_config) {
    this.moderation = new Moderation(_config);
  }
}

module.exports = Solutions;
