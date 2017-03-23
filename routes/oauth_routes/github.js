'use strict';

var oauth2Template = require('./oauth2_template.js');

module.exports = function(router, passport) {
  var githubApiData = {
    passportType: 'github',
    scope: undefined,
  };

  return oauth2Template(router, passport, githubApiData);
};
