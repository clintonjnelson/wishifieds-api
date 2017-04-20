'use strict';

var request = require('./api_request.js');

module.exports = function getPinterestInfo(accessToken, origData, callback) {

  var apiInfo = {
    apiName: 'pinterest',
    url: 'https://api.pinterest.com/v1/me',
    queryString: {fields: 'id,username,counts,image'},
  };

  // Pass thru orig profile info
  apiInfo.profile = origData;

  request(accessToken, apiInfo, callback);
};
