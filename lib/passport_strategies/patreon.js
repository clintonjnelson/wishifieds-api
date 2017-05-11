'use strict';
/* Manages creation of new facebook signs with Oauth2.0
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var PatreonStrategy    = require('passport-patreon'            ).Strategy;
var PatreonSign        = require('../../models/PatreonSign.js' );
var findOrMakeSign     = require('../sign_creation_handler.js').findOrMakeSign;
var apiBypass          = require('../api_data_requests/bypass_api_req.js');
var loginSignupHandler = require('../login_signup_handler.js' );
var cloneDeep          = require('lodash').cloneDeep;
var buildCallbackUrl   = require('../signpost_utils.js').buildCallbackUrl;

module.exports = function(passport) {
  passport.use(new PatreonStrategy({
    clientID:     process.env.PATREON_ID,
    clientSecret: process.env.PATREON_SECRET,
    callbackURL:  buildCallbackUrl('patreon') || 'http://127.0.0.1:3000/api/auth/patreon/callback',
    passReqToCallback: true,
  },
  handlePatreonResponse  // see below
  ));
};

function handlePatreonResponse(req, accessToken, refreshToken, profile, done) {

  console.log("PATREON OAUTH PROFILE IS: ", profile);
  function getEmail() {
    try      { return profile._json.attributes.email; }
    catch(e) { return ''; }
  }
  function getUsername() {
    try      { return profile._json.attributes.vanity; }
    catch(e) { return ''; }
  }

  var rearrangedProfile = cloneDeep(profile);
  rearrangedProfile.email = getEmail();
  rearrangedProfile.username = getUsername();


  var userSignInfo = {
    accessToken: accessToken,
    patreon: {
      getApiInfo: apiBypass,
      SignModel:  PatreonSign,
      mongo: {
        authType:        'patreon',
        authTypeId:      'patreonId',
        accessToken:     'patreonAccessToken',
        authIdPath:      'auth.patreon.patreonId',
        accessTokenPath: 'auth.patreon.patreonAccessToken',
      },
      apiFields: {
        apiId:       'id',
        apiEmail:    'email',      // don't use????
        apiUsername: 'username',
      },
      profileId:       profile.id,
      reqdProfileData: rearrangedProfile,    // pass since has all needed
    },
    signType: 'patreon',
    user:     req.user,
  };

  !!req.user ?
    // User logged in => add sign.
    findOrMakeSign(req, userSignInfo, done) :
    // User NOT logged in => login/signup, add sign.
    loginSignupHandler(req, userSignInfo, done);
}
