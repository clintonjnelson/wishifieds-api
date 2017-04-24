'use strict';
/* Manages creation of new facebook signs with Oauth2.0
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var DisqusStrategy     = require('passport-disqus'            ).Strategy;
var DisqusSign         = require('../../models/DisqusSign.js' );
var findOrMakeSign     = require('../sign_creation_handler.js').findOrMakeSign;
var apiBypass          = require('../api_data_requests/bypass_api_req.js');
var loginSignupHandler = require('../login_signup_handler.js' );


module.exports = function(passport) {
  passport.use(new DisqusStrategy({
    clientID:     process.env.DISQUS_ID,
    clientSecret: process.env.DISQUS_SECRET,
    callbackURL:  process.env.DISQUS_CALLBACK_URL || 'http://127.0.0.1:3000/api/auth/disqus/callback',
    passReqToCallback: true,
  },
  handleDisqusResponse  // see below
  ));
};

function handleDisqusResponse(req, accessToken, refreshToken, profile, done) {
  // console.log("DISQUS PROFILE IS: ", profile);
  // console.log("DISQUS PROFILE._JSON IS: ", profile._json);

  var userSignInfo = {
    accessToken: accessToken,
    disqus: {
      getApiInfo: apiBypass,
      SignModel:  DisqusSign,
      mongo: {
        authType:        'disqus',
        authTypeId:      'disqusId',
        accessToken:     'disqusAccessToken',
        authIdPath:      'auth.disqus.disqusId',
        accessTokenPath: 'auth.disqus.disqusAccessToken',
      },
      apiFields: {
        apiId:       'id',
        apiEmail:    'email',      // don't use????
        apiUsername: 'username',
      },
      profileId:       profile.id,
      reqdProfileData: profile,    // pass since has all needed
    },
    signType: 'disqus',
    user:     req.user,
  };

  !!req.user ?
    // User logged in => add sign.
    findOrMakeSign(req, userSignInfo, done) :
    // User NOT logged in => login/signup, add sign.
    loginSignupHandler(req, userSignInfo, done);
}
