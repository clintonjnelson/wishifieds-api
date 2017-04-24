'use strict';
/* Manages creation of new facebook signs with Oauth2.0
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var FoursquareStrategy = require('passport-foursquare'            ).Strategy;
var FoursquareSign     = require('../../models/FoursquareSign.js' );
var findOrMakeSign     = require('../sign_creation_handler.js').findOrMakeSign;
var apiBypass          = require('../api_data_requests/bypass_api_req.js');
var loginSignupHandler = require('../login_signup_handler.js' );
var _                  = require('lodash');
var buildCallbackUrl   = require('../signpost_utils.js').buildCallbackUrl;

module.exports = function(passport) {
  passport.use(new FoursquareStrategy({
    clientID:     process.env.FOURSQUARE_ID,
    clientSecret: process.env.FOURSQUARE_SECRET,
    callbackURL:  buildCallbackUrl('foursquare') || 'http://127.0.0.1:3000/api/auth/foursquare/callback',
    passReqToCallback: true,
  },
  handleFoursquareResponse  // see below
  ));
};

function handleFoursquareResponse(req, accessToken, refreshToken, profile, done) {
  console.log("FOURSQUARE PROFILE IS: ", profile);
  console.log("FOURSQUARE PROFILE.EMAILS IS: ", profile.emails);
  console.log("FOURSQUARE PROFILE.NAME IS: ", profile.name);
  console.log("FOURSQUARE PROFILE._JSON IS: ", profile._json);
  console.log("FOURSQUARE PHOTOS PROFILE._JSON.response.user.photo IS: ", profile._json.response.user.photo);
  console.log("FOURSQUARE FRIENDS PROFILE._JSON.response.user.photo IS: ", profile._json.response.user.friends);

  var rearrangedProfile      = _.cloneDeep(profile);
  rearrangedProfile.email    = rearrangedProfile.emails[0].value;
  rearrangedProfile.username = rearrangedProfile.name.givenName + rearrangedProfile.name.familyName;


  var userSignInfo = {
    accessToken: accessToken,
    foursquare: {
      getApiInfo: apiBypass,
      SignModel:  FoursquareSign,
      mongo: {
        authType:        'foursquare',
        authTypeId:      'foursquareId',
        accessToken:     'foursquareAccessToken',
        authIdPath:      'auth.foursquare.foursquareId',
        accessTokenPath: 'auth.foursquare.foursquareAccessToken',
      },
      apiFields: {
        apiId:       'id',
        apiEmail:    'email',      // don't use????
        apiUsername: 'username',
      },
      profileId:       profile.id,
      reqdProfileData: rearrangedProfile,    // pass since has all needed
    },
    signType: 'foursquare',
    user:     req.user,
  };

  !!req.user ?
    // User logged in => add sign.
    findOrMakeSign(req, userSignInfo, done) :
    // User NOT logged in => login/signup, add sign.
    loginSignupHandler(req, userSignInfo, done);
}
