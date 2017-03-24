'use strict';

var bodyparser           = require('body-parser');
var setCors              = require('../lib/routes_middleware/set_cors_permissions.js');
var removePassptSessions = require('../lib/routes_middleware/remove_passport_sessions.js');
var loadOauthRoutes      = require('./support/oauth_template.js'); // raw function


module.exports = function(router, passport) {
  var OAUTH_CONFIG = getOauthConfigsLibrary();

  router.use(bodyparser.json());
  router.use(removePassptSessions);  // bypass oauth1 sessions if exist

  // Require routes by provider
  loadOauthRoutes(router, passport, OAUTH_CONFIG.facebook);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.github);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.google);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.instagram);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.linkedin);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.stackexchange);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.twitter);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.wordpress);
};



function getOauthConfigsLibrary() {
  return {
    facebook: {
      oauthVersion: '2',
      passportType: 'facebook',
      scope: ['public_profile', 'email'],
      session: false,
    },
    github: {
      oauthVersion: '2',
      passportType: 'github',
      scope: undefined,
      session: false,
    },
    google: {
      oauthVersion: '2',
      passportType: 'google',
      scope: 'https://www.googleapis.com/auth/plus.login',
      session: false,
    },
    instagram: {
      oauthVersion: '2',
      passportType: 'instagram',
      scope: null,
      session: false,
    },
    linkedin: {
      oauthVersion: '2',
      passportType: 'linkedin',
      scope: 'r_basicprofile',
      session: false,
    },
    stackexchange: {
      oauthVersion: '2',
      passportType: 'stackexchange',
      scope: null,
    },
    twitter: {
      oauthVersion: '1',
      passportType: 'twitter',
      scope: null,
      session: false,
    },
    wordpress: {
      oauthVersion: '2',
      passportType: 'wordpress',
      scope: 'global',
      session: false,
    },
  };
}




