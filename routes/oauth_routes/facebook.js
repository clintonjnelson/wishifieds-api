'use strict';

var oauth2Template = require('./oauth2_template.js');

module.exports = function(router, passport) {
  var facebookApiData = {
    oauthVersion: '2',
    passportType: 'facebook',
    scope: ['public_profile', 'email'],
    session: false
  };

  return oauth2Template(router, passport, facebookApiData);
};
