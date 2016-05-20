// utils for helping with the request

module.exports.transformDataToParams = function(data) {
  var str = [];
  for ( var p in data ) {
    if (data.hasOwnProperty(p) && data[p]) {
      if (typeof data[p] === 'string'){
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(data[p]));
      };
      if (typeof data[p] === 'object'){
        for ( var i in data[p] ) {
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(data[p][i]));
        }
      }
    }
  }
  return str.join('&');
};

module.exports.getHeaders = function(tokenString) {
  return {
    'Authorization': 'Bearer ' + tokenString
  };
};

module.exports.getImageUrlParams = function(imageUrl) {
  var data = {};
  if ( typeof imageUrl === 'string' ) {
    data.url = [imageUrl];
  };
  if ( typeof imageUrl === 'object' ) {
    data.url = imageUrl;
  };
  return data;
};

module.exports.fillOptionalParams = function(data, optionalParams) {
  for ( var i in optionalParams ) {
    var j = i.replace(/([A-Z])/g, '_$1').replace(/^_/,'').toLowerCase();
    var params = optionalParams[i];
    if ( typeof params === 'object' && params.length > 0) {
      params = optionalParams[i].join(',');
    }
    data[j] = params;
  };
  return data;
};

module.exports.fillOptionalData = function(data, optionalData) {
  for ( var i in optionalData ) {
    var j = i.replace(/([A-Z])/g, '_$1').replace(/^_/,'').toLowerCase();
    var params = optionalData[i];
    data[j] = params;
  };
  return data;
};