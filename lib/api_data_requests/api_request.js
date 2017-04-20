'use strict';

var request = require('superagent');

module.exports = function makeApiRequest(accessToken, apiInfo, callback) {
  // Don't make same call twice, just pass data through
  if(!apiInfo.apiWasCalled) {

    request
      .get(apiInfo.url)
      .query({ access_token: accessToken })
      .query(apiInfo.queryString)      // specific data fields requested
      .end(function(err, res) {
        if (err) {
          console.log('Error accessing API data');
          callback(err, null);
        }

        // if successful
        var data = JSON.parse(res.text);
        console.log("DATA RECEIVED FROM SECOND API DATA CALL IS: ", data);
        data.profile = apiInfo.profile;  // Pass thru orig profile info
        data.apiWasCalled = true;        // Indicate API already called
        callback(null, data);
      });
  }

  // Else, just pass full data through
  else { callback(null, apiInfo); }
};

