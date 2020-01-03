'use strict';
/* Manages creation of new facebook signs with Oauth2.0
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var FacebookStrategy = require('passport-facebook').Strategy;
var infoRequest = require('../api_data_requests/api_request.js');
var Badge = require('../../db/models/index.js').Badge;


module.exports = function(passport) {
  passport.use(new FacebookStrategy({
    clientID:     process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL:  buildCallbackUrl('facebook') || 'http://localhost:5000/api/validate_credibility/facebook/callback',
    passReqToCallback: true,
  },
  saveCredibilityValidationInfo   // see below
  ));
};



function buildCallbackUrl(oauthType) {
  // Return the URL according to the environment we're in & the oauth requested
  switch(process.env.NODE_ENV) {
    case 'production':  return process.env.OAUTH_CALLBACK_BASE_HTTPS_PROD + 'api/validate_credibility/' + oauthType + '/callback'; break;
    case 'integration': return process.env.OAUTH_CALLBACK_BASE_HTTPS_INT  + 'api/validate_credibility/' + oauthType + '/callback'; break;
    case 'dev':         return process.env.OAUTH_CALLBACK_BASE_HTTPS_DEV  + 'api/validate_credibility/' + oauthType + '/callback'; break;
  }
}

// This calls out to facebook to get pertinent info for credibility validation & badging
function getFacebookInfo(accessToken, noIdentifierNeeded, callback) {

  var apiInfo = {
    apiName: 'facebook',
    url: 'https://graph.facebook.com/me/',
    queryString: {fields: 'link'},  // 'email,name,link,picture.width(720)'
  };

  infoRequest(accessToken, apiInfo, callback);
};

// facebook sends data into this callback
function saveCredibilityValidationInfo(req, accessToken, refreshToken, profile, done) {
  console.log("FACEBOOK API CALLBACK RESPONSE IS...");
  // console.log("REQ:", req);
  console.log("ACCESS_TOKEN:", accessToken);
  console.log("REFRESH_TOKEN:", refreshToken);
  console.log("PROFILE:", profile);
  console.log("REQ.USER IN FACEBOOK STRATEGY AFTER OAUTH API RESPONSE IS: ", req.user);
  var user = req.user;


  getFacebookInfo(accessToken, profile, function (err, fullApiData) {
    console.log("VALIDATE CREDIBILITY... DATA IS: ", fullApiData);
    const preBadge = {
      userId: user.id,
      badgeType: 'FACEBOOK',
      linkUrl: fullApiData.link,
      status: 'ACTIVE',
    }
    Badge
      .findOne({where: {userId: user.id, badgeType: 'FACEBOOK'}})
      .then(function(existingBadge) {
        // None found? Create new.
        if(!existingBadge) {
          Badge
            .create(preBadge)
            .then(function(newFbBadge) {
              console.log("NEW FACEBOOK BADGE IS: ", newFbBadge);
              return done(null, req.user);  // Finally, call "done", passing the user so Passport thinks it authorized the user
            })
            .catch(function(error) {
              return done(error, null);
            })
        }
        // Found? existing badge Update it.
        else {
          preBadge['id'] = existingBadge.id;  // This is the UNIQUE value enabling upsert
          Badge
            .upsert(preBadge)
            .then(function(updatedFbBadge) {
              console.log("NEW FACEBOOK BADGE IS: ", updatedFbBadge);
              return done(null, req.user);  // Finally, call "done", passing the user so Passport thinks it authorized the user
            })
            .catch(function(error) {
              console.log("Error upserting FACEBOOK badge.");
              return done(error, null);
            })
        }
      })
  });
}
