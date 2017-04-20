'use strict';
/* Manages creation of new tumblr signs with Oauth1a
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var findOrMakeSign     = require('../sign_creation_handler.js' ).findOrMakeSign;
var apiBypass          = require('../api_data_requests/bypass_api_req.js');
var loginSignupHandler = require('../login_signup_handler.js'  );
var TumblrStrategy     = require('passport-tumblr'            ).Strategy;
var TumblrSign         = require('../../models/TumblrSign.js' );



module.exports = function(passport) {
  console.log("MADE IT TO STRATEGY...");
  passport.use(new TumblrStrategy({
    consumerKey:    process.env.TUMBLR_ID,
    consumerSecret: process.env.TUMBLR_SECRET,
    callbackUrl:    process.env.TUMBLR_CALLBACK_URL || 'http://127.0.0.1:3000/api/auth/tumblr/callback',
    passReqToCallback: true,
  },
    handleTumblrResponse
  ));
};


// tumblr sends data directly into this callback
function handleTumblrResponse(req, accessToken, refreshSecret, profile, done) {
  console.log("TUMBLR RESPONDED WITH REQ.USER: ", req.user);
  console.log("TUMBLR RESPONDED WITH PROFILE: ", profile);
  console.log("TUMBLR _JSON IS: ", profile._json);
  console.log("TUMBLR BLOGS IS: ", profile._json.response.user.blogs);

  var tumblrProfileRearranged = {
    username:    profile.username,
    id:          profile.username,
    following:   profile._json.response.user.following,
    multiSigns:  profile._json.response.user.blogs,     // Eventually could make multisign
    linkUrl:     profile._json.response.user.blogs[0].url,
    description: profile._json.response.user.blogs[0].title,
  };

  var userSignInfo = {
    accessToken: accessToken,
    tumblr: {
      getApiInfo: apiBypass,   // function
      SignModel: TumblrSign,       // model Constructor Function
      mongo: {
        authType:        'tumblr',
        authTypeId:      'tumblrId',
        accessToken:     'tumblrAccessToken',
        authIdPath:      'auth.tumblr.tumblrId',
        accessTokenPath: 'auth.tumblr.tumblrAccessToken',
      },
      apiFields: {
        apiId:       'username',  // Tumblr DOES NOT HAVE userID! This will have to do.
        apiEmail:    'email',     // undefined (no email provided)
        apiUsername: 'username',
      },
      profileId: profile.id,
      reqdProfileData: tumblrProfileRearranged,  // had all needed data (less than full request tho)
    },
    signType: 'tumblr',
    user: req.user,
  };

  !!req.user ?
    // User logged in => add sign.
    findOrMakeSign(req, userSignInfo, done) :
    // User NOT logged in => login/signup, add sign.
    loginSignupHandler(req, userSignInfo, done);

}
