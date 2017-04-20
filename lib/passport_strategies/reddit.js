'use strict';
/* Manages creation of new google signs with Oauth2.0
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var findOrMakeSign     = require('../sign_creation_handler.js').findOrMakeSign;
var apiBypass          = require('../api_data_requests/bypass_api_req.js');
var RedditStrategy     = require('passport-reddit').Strategy;
var RedditSign         = require('../../models/RedditSign.js' );
var loginSignupHandler = require('../login_signup_handler.js' );


module.exports = function(passport) {
  passport.use(new RedditStrategy({
    clientID:     process.env.REDDIT_ID,
    clientSecret: process.env.REDDIT_SECRET,
    callbackURL:  process.env.REDDIT_CALLBACK_URL || 'http://127.0.0.1:3000/api/auth/reddit/callback',
    passReqToCallback: true,
  },
  handleRedditResponse  // see below
  ));
};


// google sends data into this callback
function handleRedditResponse(req, accessToken, refreshToken, profile, done) {
  console.log("REQ.USER IN REDDIT STRATEGY AFTER OAUTH API RESPONSE IS: ", req.user);
  console.log("REDDIT PROFILE INFO IS: ", profile);


  var userSignInfo = {
    accessToken: accessToken,
    reddit: {
      getApiInfo: apiBypass,
      SignModel:  RedditSign,
      mongo: {
        authType:         'reddit',
        authTypeId:       'redditId',
        accessToken:      'redditAccessToken',
        authIdPath:       'auth.reddit.redditId',
        accessTokenPath:  'auth.reddit.redditAccessToken',
      },
      apiFields: {          // where each piece of data is kept in API response
        apiId:        'id',
        apiEmail:     'email',
        apiUsername:  'name',
      },
      profileId:       profile.id,
      reqdProfileData: profile,
    },
    signType: 'reddit',
    user:     req.user,
  };

  !!req.user ?
    // User logged in => add sign
    findOrMakeSign(req, userSignInfo, done) :
    // User NOT logged in => login/signup, add sign
    loginSignupHandler(req, userSignInfo, done);
}
