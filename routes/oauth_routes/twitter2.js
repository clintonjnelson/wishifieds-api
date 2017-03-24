'use strict';

var oauthTemplate = require('./oauth_template.js');
// var oauthTemplate = require('./oauth2_template.js');

module.exports = function(router, passport) {
  var twitterApiData = {
    oauthVersion: '1',
    passportType: 'twitter',
    scope: null,
    session: false,
  };

  return oauthTemplate(router, passport, twitterApiData);
};
