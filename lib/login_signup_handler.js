'use strict';
/*
  This module works with OAuth to login users or sign them up, depending on if they
  are already in the system or not.
  Since Oauth is automated, the signin/signup needs to be as well

  Process:
    Finds user by the ID of the User's profile from Oauth provider
    User Found by Oauth Provider's ID = LOGIN case
      If found, loads the user
      Checks for sign, but should already be one.
    User NOT Found by Oauth Provider's ID = SIGNUP case
      Createa a new user
      Makes a new sign
*/


var createSign     = require('./sign_creation_handler.js').createSign;
var findOrMakeSign = require('./sign_creation_handler.js').findOrMakeSign;
var User           = require('../models/User.js');


module.exports = function loginSignupHandler(req, userSignInfo, done) {
  var accessToken = userSignInfo.accessToken;
  var signType    = userSignInfo.signType;
  var thisSign    = userSignInfo[signType];  // note: var not string
  var apiFields   = thisSign.apiFields;
  var mongo       = thisSign.mongo;
  var SignModel   = thisSign.SignModel;
  console.log("IN LOGIN SIGNUP HANDLER FOR LOGGING IN. USER_SIGN_INFO IS: ", userSignInfo);
  console.log("LOGIN SIGNUP HANDLER. THIS_SIGN IS: ", thisSign);

  findUserFromProfileIdOrEmail(done, updateExistingUserOrMakeNewUserAndSign);


  // ----------- Helpers ------------
  function findUserFromProfileIdOrEmail(done, callback) {
    var mongoUserQuery = {};
    mongoUserQuery[mongo.authIdPath] = thisSign.profileId;
    console.log("MONGO USER QUERY IS: ", mongoUserQuery);

    // Try find user by profile.id
    User.findOne(mongoUserQuery, function(err, user) {
      console.log("USER RETURNED FROM QUERY IS: ", user);
      if (err) { return done('database error finding user', err); }

      // No user found by profileId
      if (!user || !user['auth'][mongo.authType][mongo.authTypeId] ) {

        // Try to find by email address instead. Get the emali address via api & check.
        thisSign.getApiInfo(accessToken, thisSign.reqdProfileData, function(err, apiData) {
          if(err) {
            return done('error accessing API for login');
          }

          var apiEmail = apiData[apiFields.apiEmail];  // find email by expected name
          console.log("EMAIL TO FIND IS: ", apiEmail);
          User.findOne({email: apiEmail}, function(error, usr) {
            if(err)  { return done('database error finding user by email', err); }

            // Final find, so pass whatever it found back to callback
            callback(usr, done);  // usr could be a user or NOTHING. Do check in callback.
          });
        });
      }
      else {  // User found => update access token, find/make sign.
        callback(user, done);
      }
    });
  }

  // Callback Helper
  function updateExistingUserOrMakeNewUserAndSign(user, done) {
    if(!user) {  // No user exists, create a new user & sign
      var userInfo = {};
      userInfo[mongo.authIdPath     ] = apiData[apiFields.apiId      ];
      userInfo[mongo.accessTokenPath] = accessToken;
      userInfo['email'              ] = apiEmail;// apiData[apiFields.apiEmail   ];
      userInfo['username'           ] = apiData[apiFields.apiUsername];

      console.log("USERINFO", userInfo);
      // Find/create User. Note that makeOrValidateUsername is called in validations!
      User.create(userInfo, function(err, user) {
          if (err) { return done('error saving user'); }
          if (!user || !user.auth[mongo.authType][mongo.authTypeId]) {
            console.log('Could not create user: ', user);
            return done('could not create user');
          }

          // New user => new sign => DONE.
          return createSign(signType, apiData, user, done);
      });
    }
    else {  // User found => update access token on user, find/make sign.
      userSignInfo.user = user;
      findOrMakeSign(req, userSignInfo, done);
    }
  }
};


