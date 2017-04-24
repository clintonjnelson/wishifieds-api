'use strict';

var request = require('./api_request.js');

module.exports = function getEtsyInfo(accessToken, origData, callback) {

  var apiInfo = {
    apiName: 'pinterest',
    url: buildUrl(origData.id),
    queryString: apiKeyQueryString(),
  };
  apiInfo.profile = origData;  // Pass orig profile info

  function apiKeyQueryString() { return 'api_key=' + process.env.ETSY_ID; }
  function buildUrl(username)  { return 'https://openapi.etsy.com/v2/users/' + username + '/profile' }

  // console.log("API INFO FOR CALLING API AGAIN IS: ", apiInfo);
  request(accessToken, apiInfo, callback);
};
