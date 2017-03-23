'use strict';

var oauth2Template = require('./oauth2_template.js');

module.exports = function(router, passport) {
  var wordpressApiData = {
    passportType: 'wordpress',
    scope: 'global',
  };

  return oauth2Template(router, passport, wordpressApiData);
};
