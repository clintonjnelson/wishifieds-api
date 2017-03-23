'use strict';

var oauth2Template = require('./oauth2_template.js');

module.exports = function(router, passport) {
  var linkedinApiData = {
    passportType: 'linkedin',
    scope: 'r_basicprofile',
  };

  return oauth2Template(router, passport, linkedinApiData);
};
