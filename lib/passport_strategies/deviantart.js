'use strict';
/* Manages creation of new facebook signs with Oauth2.0
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var DeviantartStrategy = require('passport-deviantart'            ).Strategy;
var DeviantartSign     = require('../../models/DeviantartSign.js' );
var findOrMakeSign     = require('../sign_creation_handler.js').findOrMakeSign;
var apiBypass          = require('../api_data_requests/bypass_api_req.js');
var loginSignupHandler = require('../login_signup_handler.js' );
var buildCallbackUrl   = require('../signpost_utils.js').buildCallbackUrl;

module.exports = function(passport) {
  passport.use(new DeviantartStrategy({
    clientID:     process.env.DEVIANTART_ID,
    clientSecret: process.env.DEVIANTART_SECRET,
    callbackURL:  buildCallbackUrl('deviantart') || 'http://127.0.0.1:3000/api/auth/deviantart/callback',
    passReqToCallback: true,
  },
  handleDeviantartResponse  // see below
  ));
};

function handleDeviantartResponse(req, accessToken, refreshToken, profile, done) {
  console.log("DEVIANTART PROFILE IS: ", profile);
  console.log("DEVIANTART PROFILE._JSON IS: ", profile._json);

  var userSignInfo = {
    accessToken: accessToken,
    deviantart: {
      getApiInfo: apiBypass,
      SignModel:  DeviantartSign,
      mongo: {
        authType:        'deviantart',
        authTypeId:      'deviantartId',
        accessToken:     'deviantartAccessToken',
        authIdPath:      'auth.deviantart.deviantartId',
        accessTokenPath: 'auth.deviantart.deviantartAccessToken',
      },
      apiFields: {
        apiId:       'id',
        apiEmail:    'email',      // don't use????
        apiUsername: 'username',
      },
      profileId:       profile.id,
      reqdProfileData: profile,    // pass since has all needed
    },
    signType: 'deviantart',
    user:     req.user,
  };

  !!req.user ?
    // User logged in => add sign.
    findOrMakeSign(req, userSignInfo, done) :
    // User NOT logged in => login/signup, add sign.
    loginSignupHandler(req, userSignInfo, done);
}
