'use strict';

var oauth2Template = require('./oauth2_template.js');

module.exports = function(router, passport) {
  var facebookApiData = {
    passportType: 'facebook',
    scope: ['public_profile', 'email'],
  };

  return oauth2Template(router, passport, facebookApiData);
};
