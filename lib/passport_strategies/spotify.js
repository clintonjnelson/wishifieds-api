'use strict';
/* Manages creation of new facebook signs with Oauth2.0
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var SpotifyStrategy    = require('passport-spotify'            ).Strategy;
var SpotifySign        = require('../../models/SpotifySign.js' );
var findOrMakeSign     = require('../sign_creation_handler.js').findOrMakeSign;
var apiBypass          = require('../api_data_requests/bypass_api_req.js');
var loginSignupHandler = require('../login_signup_handler.js' );
var buildCallbackUrl   = require('../signpost_utils.js').buildCallbackUrl;

module.exports = function(passport) {
  passport.use(new SpotifyStrategy({
    clientID:     process.env.SPOTIFY_ID,
    clientSecret: process.env.SPOTIFY_SECRET,
    callbackURL:  buildCallbackUrl('spotify') || 'http://127.0.0.1:3000/api/auth/spotify/callback',
    passReqToCallback: true,
  },
  handleSpotifyResponse  // see below
  ));
};

function handleSpotifyResponse(req, accessToken, refreshToken, profile, done) {
  console.log("SPOTIFY PROFILE IS: ", profile);
  console.log("SPOTIFY PROFILE.photos IS: ", profile.photos);
  console.log("SPOTIFY PROFILE._JSON IS: ", profile._json);


  var userSignInfo = {
    accessToken: accessToken,
    spotify: {
      getApiInfo: apiBypass,
      SignModel:  SpotifySign,
      mongo: {
        authType:        'spotify',
        authTypeId:      'spotifyId',
        accessToken:     'spotifyAccessToken',
        authIdPath:      'auth.spotify.spotifyId',
        accessTokenPath: 'auth.spotify.spotifyAccessToken',
      },
      apiFields: {
        apiId:       'id',
        apiEmail:    'email',      // don't use????
        apiUsername: 'username',
      },
      profileId:       profile.id,
      reqdProfileData: profile,    // pass since has all needed
    },
    signType: 'spotify',
    user:     req.user,
  };

  !!req.user ?
    // User logged in => add sign.
    findOrMakeSign(req, userSignInfo, done) :
    // User NOT logged in => login/signup, add sign.
    loginSignupHandler(req, userSignInfo, done);
}
