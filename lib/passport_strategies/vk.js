'use strict';
/* Manages creation of new facebook signs with Oauth2.0
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var VkStrategy         = require('passport-vkontakte'         ).Strategy;
var VkSign             = require('../../models/VkSign.js'     );
var findOrMakeSign     = require('../sign_creation_handler.js').findOrMakeSign;
var apiBypass          = require('../api_data_requests/bypass_api_req.js');
var loginSignupHandler = require('../login_signup_handler.js' );


module.exports = function(passport) {
  passport.use(new VkStrategy({
    clientID:     process.env.VK_ID,
    clientSecret: process.env.VK_SECRET,
    callbackURL:  process.env.VK_CALLBACK_URL || 'http://127.0.0.1:3000/api/auth/vkontakte/callback',
    passReqToCallback: true,
  },
  handleVkResponse  // see below
  ));
};

function handleVkResponse(req, accessToken, refreshToken, profile, done) {
  console.log("VK PROFILE IS: ", profile);
  console.log("VK PROFILE._JSON IS: ", profile._json);

  var userSignInfo = {
    accessToken: accessToken,
    vk: {
      getApiInfo: apiBypass,
      SignModel:  VkSign,
      mongo: {
        authType:        'vk',
        authTypeId:      'vkId',
        accessToken:     'vkAccessToken',
        authIdPath:      'auth.vk.vkId',
        accessTokenPath: 'auth.vk.vkAccessToken',
      },
      apiFields: {
        apiId:       'id',
        apiEmail:    'email',      // don't use????
        apiUsername: 'username',
      },
      profileId:       profile.id,
      reqdProfileData: profile,    // pass since has all needed
    },
    signType: 'vk',
    user:     req.user,
  };

  !!req.user ?
    // User logged in => add sign.
    findOrMakeSign(req, userSignInfo, done) :
    // User NOT logged in => login/signup, add sign.
    loginSignupHandler(req, userSignInfo, done);
}
