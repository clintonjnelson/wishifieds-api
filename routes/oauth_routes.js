'use strict';

var bodyparser           = require('body-parser');
var setCors              = require('../lib/routes_middleware/set_cors_permissions.js');
// var removePassptSessions = require('../lib/routes_middleware/remove_passport_sessions.js');
var loadOauthRoutes      = require('./oauth/oauth_template.js'); // raw function


module.exports = function(router, passport) {
  var OAUTH_CONFIG = getOauthConfigsLibrary();

  router.use(bodyparser.json());
  // router.use(removePassptSessions);  // bypass oauth1 sessions if needed (bring in "remove_passport_sessions.js" from syynpost project)

  // Require routes by provider
  loadOauthRoutes(router, passport, OAUTH_CONFIG.facebook);
};



function getOauthConfigsLibrary() {
  return {
    facebook: {
      oauthVersion: '2',
      passportType: 'facebook',
      scope: ['user_link'],  // 'public_profile', 'email'
      session: false,
    }
  };
}




