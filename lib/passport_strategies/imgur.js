'use strict';
/* Manages creation of new facebook signs with Oauth2.0
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var ImgurStrategy      = require('passport-imgur'            ).Strategy;
var ImgurSign          = require('../../models/ImgurSign.js' );
var findOrMakeSign     = require('../sign_creation_handler.js').findOrMakeSign;
var apiBypass          = require('../api_data_requests/bypass_api_req.js');
var loginSignupHandler = require('../login_signup_handler.js' );


module.exports = function(passport) {
  passport.use(new ImgurStrategy({
    clientID:     process.env.IMGUR_ID,
    clientSecret: process.env.IMGUR_SECRET,
    callbackURL:  process.env.IMGUR_CALLBACK_URL || 'http://127.0.0.1:3000/api/auth/imgur/callback',
    passReqToCallback: true,
  },
  handleImgurResponse  // see below
  ));
};

function handleImgurResponse(req, accessToken, refreshToken, profile, done) {
  console.log("IMGUR PROFILE IS: ", profile);

  var userSignInfo = {
    accessToken: accessToken,
    imgur: {
      getApiInfo: apiBypass,
      SignModel:  ImgurSign,
      mongo: {
        authType:        'imgur',
        authTypeId:      'imgurId',
        accessToken:     'imgurAccessToken',
        authIdPath:      'auth.imgur.imgurId',
        accessTokenPath: 'auth.imgur.imgurAccessToken',
      },
      apiFields: {
        apiId:       'id',
        apiEmail:    'email',      // don't use????
        apiUsername: 'url',
      },
      profileId:       profile.id,
      reqdProfileData: profile,    // pass since has all needed
    },
    signType: 'imgur',
    user:     req.user,
  };

  !!req.user ?
    // User logged in => add sign.
    findOrMakeSign(req, userSignInfo, done) :
    // User NOT logged in => login/signup, add sign.
    loginSignupHandler(req, userSignInfo, done);
}
