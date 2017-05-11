'use strict';
/* Manages creation of new facebook signs with Oauth2.0
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var AmazonStrategy     = require('passport-amazon'            ).Strategy;
var AmazonSign         = require('../../models/AmazonSign.js' );
var findOrMakeSign     = require('../sign_creation_handler.js').findOrMakeSign;
var apiBypass          = require('../api_data_requests/bypass_api_req.js');
var loginSignupHandler = require('../login_signup_handler.js' );
var cloneDeep          = require('lodash').cloneDeep;
var buildCallbackUrl   = require('../signpost_utils.js').buildCallbackUrl;

module.exports = function(passport) {
  passport.use(new AmazonStrategy({
    clientID:     process.env.AMAZON_ID,
    clientSecret: process.env.AMAZON_SECRET,
    callbackURL:  buildCallbackUrl('amazon') || 'http://127.0.0.1:3000/api/auth/amazon/callback',
    passReqToCallback: true,
  },
  handleAmazonResponse  // see below
  ));
};

function handleAmazonResponse(req, accessToken, refreshToken, profile, done) {

  function getEmail() {
    try      { return profile.emails[0].value; }
    catch(e) { return ''; }
  }
  function buildUsernameFromDisplayName() {
    try      { return profile.displayName.replace(/ /g, ''); }
    catch(e) { return ''; }
  }

  var rearrangedProfile = cloneDeep(profile);
  rearrangedProfile.email = getEmail();
  rearrangedProfile.username = buildUsernameFromDisplayName();

  console.log("AMAZON OAUTH PROFILE IS: ", profile);

  var userSignInfo = {
    accessToken: accessToken,
    amazon: {
      getApiInfo: apiBypass,
      SignModel:  AmazonSign,
      mongo: {
        authType:        'amazon',
        authTypeId:      'amazonId',
        accessToken:     'amazonAccessToken',
        authIdPath:      'auth.amazon.amazonId',
        accessTokenPath: 'auth.amazon.amazonAccessToken',
      },
      apiFields: {
        apiId:       'id',
        apiEmail:    'email',      // don't use????
        apiUsername: 'username',
      },
      profileId:       profile.id,
      reqdProfileData: rearrangedProfile,    // pass since has all needed
    },
    signType: 'amazon',
    user:     req.user,
  };

  !!req.user ?
    // User logged in => add sign.
    findOrMakeSign(req, userSignInfo, done) :
    // User NOT logged in => login/signup, add sign.
    loginSignupHandler(req, userSignInfo, done);
}
