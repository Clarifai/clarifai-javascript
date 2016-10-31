"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* class representing a concept and its info
* @class
*/
var Concept = function () {
  function Concept(_config, data) {
    _classCallCheck(this, Concept);

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


  _createClass(Concept, [{
    key: "toObject",
    value: function toObject() {
      return this._rawData;
    }
  }]);

  return Concept;
}();

;

module.exports = Concept;