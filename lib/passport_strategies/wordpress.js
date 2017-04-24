'use strict';
/* Manages creation of new wordpress signs with Oauth2.0
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var WordpressStrategy   = require('passport-wordpress'           ).Strategy;
var WordpressSign       = require('../../models/WordpressSign.js');
var findOrMakeSign      = require('../sign_creation_handler.js'  ).findOrMakeSign;
var getWordpressInfo    = require('../api_data_requests/wordpress_api_req.js');
var loginSignupHandler  = require('../login_signup_handler.js'   );
var buildCallbackUrl   = require('../signpost_utils.js').buildCallbackUrl;

module.exports = function(passport) {
  passport.use(new WordpressStrategy({
    clientID:     process.env.WORDPRESS_ID,
    clientSecret: process.env.WORDPRESS_SECRET,
    callbackURL:  buildCallbackUrl('wordpress') || 'http://127.0.0.1:3000/api/auth/wordpress/callback',
    passReqToCallback: true,
  },
  handleWordpressResponse   // see below
  ));
};

function handleWordpressResponse(req, accessToken, refreshToken, profile, done) {
  console.log("REQ.USER IN WORDPRESS STRATEGY AFTER OAUTH API RESPONSE IS: ", req.user);
  console.log("WORDPRESS RESPONSE PROFILE IS: ", profile);

  var userSignInfo = {
    accessToken: accessToken,
    wordpress: {
      getApiInfo: getWordpressInfo,
      SignModel:  WordpressSign,
      mongo: {
        authType:        'wordpress',
        authTypeId:      'wordpressId',
        accessToken:     'wordpressAccessToken',
        authIdPath:      'auth.wordpress.wordpressId',
        accessTokenPath: 'auth.wordpress.wordpressAccessToken',
      },
      apiFields: {            // fields from api parse file
        apiId:       'ID',
        apiEmail:    'email',
        apiUsername: 'username'
      },
      profileId:       profile._json.ID,
      reqdProfileData: profile._json,      // all data is in profile._json obj
    },
    isMultiSign: true,
    signType: 'wordpress',
    user:     req.user,
  };

  !!req.user ?
    // User logged in => add sign
    findOrMakeSign(req, userSignInfo, done) :
    // User NOT logged in => login/signup, add sign
    loginSignupHandler(req, userSignInfo, done);
}

// ReqdProfileData: {
//   ID: 58451710,
//   display_name: 'clintonjnelson',
//   username: 'clintonjnelson',
//   email: 'clintonjnelson@live.com',
//   primary_blog: 61259707,
//   primary_blog_url: 'http://clintonjnelson.wordpress.com',
//   language: 'en',
//   locale_variant: '',
//   token_site_id: false,
//   token_scope: [ 'global' ],
//   avatar_URL: 'https://1.gravatar.com/avatar/4571f75b2226b1f6b8cd5fa8e4b44ecf?s=96&d=identicon',
//   profile_URL: 'http://en.gravatar.com/clintonjnelson',
//   verified: true,
//   email_verified: true,
//   date: '2013-11-28T02:01:11+00:00',
//   site_count: 2,
//   visible_site_count: 2,
//   has_unseen_notes: false,
//   newest_note_type: '',
//   phone_account: false,
//   meta: { links: [Object] },
//   is_valid_google_apps_country: true,
//   is_new_reader: false }
