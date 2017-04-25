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
  var profileData = thisSign.reqdProfileData;
  var SignModel   = thisSign.SignModel;
  console.log("IN LOGIN SIGNUP HANDLER FOR LOGGING IN. USER_SIGN_INFO IS: ", userSignInfo);
  console.log("LOGIN SIGNUP HANDLER. THIS_SIGN IS: ", thisSign);

  findUserFromProfileIdOrEmail(done, updateExistingUserOrMakeNewUserAndSign);


  // ----------- Helpers ------------
  function findUserFromProfileIdOrEmail(done, cbUpdateUserOrMakeNew) {
    var mongoUserQuery = {};
    mongoUserQuery[mongo.authIdPath] = thisSign.profileId;

    // Try find user by profile.id
    User.findOne(mongoUserQuery, function(err, user) {
      if (err) { return done('database error finding user', err); }

      // If NO user found by profileId
      if (!user || !user['auth'][mongo.authType][mongo.authTypeId] ) {

        // Try to find by email address instead. Get the emali address via api & check.
        var userEmail = profileData[apiFields.apiEmail];
        if(!userEmail) {
          thisSign.getApiInfo(accessToken, profileData, function(err, apiData) {
            if(err) {
              return done('error accessing API for login');
            }

            // Update the userSignInfo reqdProfileData with extended version
            userSignInfo[mongo.authType]['reqdProfileData'] = apiData;

            var apiEmail = apiData[apiFields.apiEmail];  // find email by expected name
            if(apiEmail) {
              return findUserByEmail(apiEmail, apiData);
            }
            // No email => assume new user
            else {
              cbUpdateUserOrMakeNew(null, apiData, done);
            }
          });
        }
        // Email found => try find user
        else {
          findUserByEmail(userEmail, profileData);
        }
      }
      // User found => update access token, find/make sign.
      else {
        cbUpdateUserOrMakeNew(user, null, done);
      }

      function findUserByEmail(email, profileOrApiData) {
        User.findOne({email: email}, function(error, usr) {
          if(err)  { return done('database error finding user by email', err); }
          if(!usr) {
            return cbUpdateUserOrMakeNew(null, profileOrApiData, done);
          }
          // Final find, so pass whatever it found back to callback
          cbUpdateUserOrMakeNew(usr, profileOrApiData, done);  // usr could be a user or NOTHING. Do check in callback.
        });
      }
    });
  }

  // Callback Helper
  // CHANGE THIS FUNCTION SO WE DON"T NEED THE FULL API DATA HERE.. DO WE???
  // OR GET IT BACK THERE & DON"T GET IT LATER< BUT MAY NOT NEED IT...
  function updateExistingUserOrMakeNewUserAndSign(user, apiData, done) {
    if(!user) {  // No user exists, create a new user & sign
      console.log("DATA TO CHOOSE FROM WHEN MAKING NEW USER IS: ", apiData);
      var userInfo = {};
      userInfo[mongo.authIdPath     ] = apiData[apiFields.apiId] || thisSign.profileId;
      userInfo[mongo.accessTokenPath] = accessToken;
      userInfo['email'              ] = apiData[apiFields.apiEmail] || (apiData.profile && apiData.profile[apiFields.apiId]);
      userInfo['username'           ] = apiData[apiFields.apiUsername] || (apiData.profile && apiData.profile[apiFields.apiUsername]);

      // if(!userInfo.email) { delete userInfo.email };  // otherwise will fail validations
      console.log("USERINFO FOR CREATION", userInfo);
      // Find/create User. Note that makeOrValidateUsername is called in validations!
      User.create(userInfo, function(err, user) {
          if (err) { return done('error saving user'); }
          if (!user || !user.auth[mongo.authType][mongo.authTypeId]) {
            console.log('Could not create user: ', user);
            return done('could not create user');
          }

          // New user => new sign => DONE.
          userSignInfo.user = user;
          console.log("LOGIN_SIGNUP_HANDLER GOING TO CREATE SIGNS - THIS SHOULD NOW HAVE USER: ", userSignInfo);
          findOrMakeSign(req, userSignInfo, done);
      });
    }
    else {  // User found => update access token on user, find/make sign.
      userSignInfo.user = user;
      console.log("LOGIN_SIGNUP_HANDLER GOING TO CREATE SIGNS - THIS SHOULD NOW HAVE USER: ", userSignInfo);
      findOrMakeSign(req, userSignInfo, done);
    }
  }
};


