'use strict';
/* Manages creation of new google signs with Oauth2.0
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var findOrMakeSign     = require('../sign_creation_handler.js').findOrMakeSign;
var apiBypass          = require('../api_data_requests/bypass_api_req.js');
var YoutubeStrategy    = require('passport-youtube-v3').Strategy;
var YoutubeSign        = require('../../models/YoutubeSign.js' );
var loginSignupHandler = require('../login_signup_handler.js' );


module.exports = function(passport) {
  passport.use(new YoutubeStrategy({
    clientID:     process.env.YOUTUBE_ID,
    clientSecret: process.env.YOUTUBE_SECRET,
    callbackURL:  process.env.YOUTUBE_CALLBACK_URL || 'http://127.0.0.1:3000/api/auth/youtube/callback',
    passReqToCallback: true,
  },
  handleYoutubeResponse  // see below
  ));
};


// google sends data into this callback
function handleYoutubeResponse(req, accessToken, refreshToken, profile, done) {
  console.log("REQ.USER IN YOUTUBE STRATEGY AFTER OAUTH API RESPONSE IS: ", req.user);
  console.log("YOUTUBE PROFILE INFO IS: ", profile);
  console.log("PROFILE ITEMS IS: ", profile._json.items);
  console.log("PROFILE THUMBNAILS IS: ", profile._json.items[0].snippet.thumbnails);
  console.log("PROFILE DEFAULT THUMBNAILS IS: ", profile._json.items[0].snippet.thumbnails.default);
  console.log("PROFILE LOCALIZED IS: ", profile._json.items[0].snippet.localized);


  var userSignInfo = {
    accessToken: accessToken,
    youtube: {
      getApiInfo: apiBypass,
      SignModel:  YoutubeSign,
      mongo: {
        authType:         'youtube',
        authTypeId:       'youtubeId',
        accessToken:      'youtubeAccessToken',
        authIdPath:       'auth.youtube.youtubeId',
        accessTokenPath:  'auth.youtube.youtubeAccessToken',
      },
      apiFields: {          // where each piece of data is kept in API response
        apiId:        'id',
        apiEmail:     'email',
        apiUsername:  'displayName',
      },
      profileId:       profile.id,
      reqdProfileData: profile,
    },
    signType: 'youtube',
    user:     req.user,
  };

  !!req.user ?
    // User logged in => add sign
    findOrMakeSign(req, userSignInfo, done) :
    // User NOT logged in => login/signup, add sign
    loginSignupHandler(req, userSignInfo, done);
}
