'use strict';
/* Manages creation of new facebook signs with Oauth2.0
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var VimeoStrategy      = require('passport-vimeo-oauth2'     ).Strategy;
var VimeoSign          = require('../../models/VimeoSign.js' );
var findOrMakeSign     = require('../sign_creation_handler.js').findOrMakeSign;
var apiBypass          = require('../api_data_requests/bypass_api_req.js');
var loginSignupHandler = require('../login_signup_handler.js' );
var buildCallbackUrl   = require('../signpost_utils.js').buildCallbackUrl;

module.exports = function(passport) {
  passport.use(new VimeoStrategy({
    clientID:     process.env.VIMEO_ID,
    clientSecret: process.env.VIMEO_SECRET,
    callbackURL:  buildCallbackUrl('vimeo') || 'http://127.0.0.1:3000/api/auth/vimeo/callback',
    passReqToCallback: true,
  },
  handleVimeoResponse  // see below
  ));
};

function handleVimeoResponse(req, accessToken, refreshToken, profile, done) {
  console.log("VIMEO PROFILE IS: ", profile);
  console.log("VIMEO PROFILE._JSON IS: ", profile._json.pictures);
  console.log("VIMEO STATS IS: ", profile._json.stats);
  console.log("VIMEO METADATA IS: ", profile._json.metadata);

  var userSignInfo = {
    accessToken: accessToken,
    vimeo: {
      getApiInfo: apiBypass,
      SignModel:  VimeoSign,
      mongo: {
        authType:        'vimeo',
        authTypeId:      'vimeoId',
        accessToken:     'vimeoAccessToken',
        authIdPath:      'auth.vimeo.vimeoId',
        accessTokenPath: 'auth.vimeo.vimeoAccessToken',
      },
      apiFields: {
        apiId:       'id',
        apiEmail:    'email',      // don't use????
        apiUsername: 'username',
      },
      profileId:       profile.id,
      reqdProfileData: profile,    // pass since has all needed
    },
    signType: 'vimeo',
    user:     req.user,
  };

  !!req.user ?
    // User logged in => add sign.
    findOrMakeSign(req, userSignInfo, done) :
    // User NOT logged in => login/signup, add sign.
    loginSignupHandler(req, userSignInfo, done);
}
