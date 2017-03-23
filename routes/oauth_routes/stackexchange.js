'use strict';

var oauth2Template = require('./oauth2_template.js');

module.exports = function(router, passport) {
  var stackexchangeApiData = {
    passportType: 'stackexchange',
    scope: null,
  };

  return oauth2Template(router, passport, stackexchangeApiData);
};
