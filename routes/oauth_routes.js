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
  loadOauthRoutes(router, passport, OAUTH_CONFIG.amazon);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.deviantart);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.disqus);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.etsy);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.facebook);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.foursquare);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.github);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.google);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.imgur);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.instagram);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.linkedin);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.patreon);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.pinterest);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.reddit);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.spotify);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.stackexchange);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.tumblr);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.twitter);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.vimeo);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.vkontakte);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.wordpress);
  loadOauthRoutes(router, passport, OAUTH_CONFIG.youtube);
};



function getOauthConfigsLibrary() {
  return {
    amazon: {
      oauthVersion: '2',
      passportType: 'amazon',
      scope: 'profile',
      session: false,
    },
    deviantart: {
      oauthVersion: '2',
      passportType: 'deviantart',
      scope: 'basic',
      session: false,
    },
    disqus: {
      oauthVersion: '2',
      passportType: 'disqus',
      scope: undefined,
      session: false,
    },
    etsy: {
      oauthVersion: '1',
      passportType: 'etsy',
      scope: 'profile_r',
      session: false,
    },
    facebook: {
      oauthVersion: '2',
      passportType: 'facebook',
      scope: ['public_profile', 'email'],
      session: false,
    },
    foursquare: {
      oauthVersion: '2',
      passportType: 'foursquare',
      scope: undefined,
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
    imgur: {
      oauthVersion: '2',
      passportType: 'imgur',
      scope: null,
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
    patreon: {
      oauthVersion: '2',
      passportType: 'patreon',
      scope: 'users',
      session: false,
    },
    pinterest: {
      oauthVersion: '2',
      passportType: 'pinterest',
      scope: 'read_public',
      session: false,
    },
    reddit: {
      oauthVersion: '2',
      passportType: 'reddit',
      scope: 'identity',
      state: 'PLACEHOLDERFORNOW',
    },
    spotify: {
      oauthVersion: '2',
      passportType: 'spotify',
      scope: null,
      session: false,
    },
    stackexchange: {
      oauthVersion: '2',
      passportType: 'stackexchange',
      scope: null,
    },
    tumblr: {
      oauthVersion: '1',
      passportType: 'tumblr',
      scope: null,
      session: false,
    },
    twitter: {
      oauthVersion: '1',
      passportType: 'twitter',
      scope: null,
      session: false,
    },
    vimeo: {
      oauthVersion: '2',
      passportType: 'vimeo',
      scope: 'public',
      session: false,
    },
    vkontakte: {
      oauthVersion: '2',
      passportType: 'vkontakte',
      scope: undefined,
      session: false,
    },
    wordpress: {
      oauthVersion: '2',
      passportType: 'wordpress',
      scope: 'global',
      session: false,
    },
    youtube: {
      oauthVersion: '2',
      passportType: 'youtube',
      scope: 'https://www.googleapis.com/auth/youtube.readonly',
      session: false,
    }
  };
}




