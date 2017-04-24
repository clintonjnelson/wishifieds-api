'use strict';
/* Manages creation of new facebook signs with Oauth2.0
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var EtsyStrategy       = require('passport-etsy'            ).Strategy;
var EtsySign           = require('../../models/EtsySign.js' );
var findOrMakeSign     = require('../sign_creation_handler.js').findOrMakeSign;
var getEtsyUserApiData = require('../api_data_requests/etsy_api_req.js');
var loginSignupHandler = require('../login_signup_handler.js' );
var buildCallbackUrl   = require('../signpost_utils.js').buildCallbackUrl;

module.exports = function(passport) {
  passport.use(new EtsyStrategy({
    consumerKey:    process.env.ETSY_ID,
    consumerSecret: process.env.ETSY_SECRET,
    callbackURL:    buildCallbackUrl('etsy') || 'http://127.0.0.1:3000/api/auth/etsy/callback',
    passReqToCallback: true,
  },
  handleEtsyResponse  // see below
  ));
};

function handleEtsyResponse(req, accessToken, refreshToken, profile, done) {
  // console.log("ETSY PROFILE IS: ", profile);
  // console.log("ETSY PROFILE._JSON IS: ", profile._json);

  var userSignInfo = {
    accessToken: accessToken,
    etsy: {
      getApiInfo: getEtsyUserApiData,
      SignModel:  EtsySign,
      mongo: {
        authType:        'etsy',
        authTypeId:      'etsyId',
        accessToken:     'etsyAccessToken',
        authIdPath:      'auth.etsy.etsyId',
        accessTokenPath: 'auth.etsy.etsyAccessToken',
      },
      apiFields: {
        apiId:       'id',
        apiEmail:    'email',      // don't use????
        apiUsername: 'name',
      },
      profileId:       profile.id,
      reqdProfileData: profile,    // pass since has all needed
    },
    signType: 'etsy',
    user:     req.user,
  };

  !!req.user ?
    // User logged in => add sign.
    findOrMakeSign(req, userSignInfo, done) :
    // User NOT logged in => login/signup, add sign.
    loginSignupHandler(req, userSignInfo, done);
}
