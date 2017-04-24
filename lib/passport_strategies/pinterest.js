'use strict';
/* Manages creation of new pinterest signs with Oauth2.0
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var findOrMakeSign     = require('../sign_creation_handler.js').findOrMakeSign;
var PinterestApiReq    = require('../api_data_requests/pinterest_api_req.js');
var PinterestStrategy  = require('passport-pinterest-oauth').OAuth2Strategy;
var PinterestSign      = require('../../models/PinterestSign.js' );
var loginSignupHandler = require('../login_signup_handler.js' );
var buildCallbackUrl   = require('../signpost_utils.js').buildCallbackUrl;

module.exports = function(passport) {
  passport.use(new PinterestStrategy({
    clientID:     process.env.PINTEREST_ID,
    clientSecret: process.env.PINTEREST_SECRET,
    callbackURL:  buildCallbackUrl('pinterest') || 'http://127.0.0.1:3000/api/auth/pinterest/callback',
    passReqToCallback: true,
  },
  handlePinterestResponse  // see below
  ));
};


// pinterest sends data into this callback
function handlePinterestResponse(req, accessToken, refreshToken, profile, done) {
  console.log("REQ.USER IN PINTEREST STRATEGY AFTER OAUTH API RESPONSE IS: ", req.user);
  console.log("PROFILE IN PINTEREST STRATEGY IS: ", profile);


  var userSignInfo = {
    accessToken: accessToken,
    pinterest: {
      getApiInfo: PinterestApiReq,
      SignModel:  PinterestSign,
      mongo: {
        authType:         'pinterest',
        authTypeId:       'pinterestId',
        accessToken:      'pinterestAccessToken',
        authIdPath:       'auth.pinterest.pinterestId',
        accessTokenPath:  'auth.pinterest.pinterestAccessToken',
      },
      apiFields: {          // where each piece of data is kept in API response
        apiId:        'id',
        apiEmail:     'email',
        apiUsername:  'displayName',
      },
      profileId:       profile.id,
      reqdProfileData: profile,
    },
    signType: 'pinterest',
    user:     req.user,
  };

  !!req.user ?
    // User logged in => add sign
    findOrMakeSign(req, userSignInfo, done) :
    // User NOT logged in => login/signup, add sign
    loginSignupHandler(req, userSignInfo, done);
}
