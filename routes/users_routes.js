'use strict';

var bodyparser   = require('body-parser'      );
var contains     = require('lodash'           ).contains;
var eatOnReq     = require('../lib/routes_middleware/eat_on_req.js');
var eatAuth      = require('../lib/routes_middleware/eat_auth.js'  )(process.env.AUTH_SECRET);
var ownerAuth    = require('../lib/routes_middleware/owner_auth.js');
var adminAuth    = require('../lib/routes_middleware/admin_auth.js');
var mongoose     = require('mongoose');
var User         = require('../models/User.js');
var MailService  = require('../lib/mailing/mail_service.js');
var EmailBuilder = require('../lib/mailing/email_content_builder.js');
var Utils        = require('../lib/signpost_utils.js');
// relocate this for sharing with password reset function
var EMAIL_REGEX = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

module.exports = function(router) {
  router.use(bodyparser.json());

  // Get user by ID (_id)
  router.get('/users/:usernameOrId', eatOnReq, eatAuth, ownerAuth('usernameOrId'), function(req, res) {
    var usernameOrId = req.params.usernameOrId;
    var userQuery = mongoose.Types.ObjectId.isValid(usernameOrId) ?
      {_id:      usernameOrId} :    // Matches as an ID type
      {username: usernameOrId};      // Default as a username type
    User.find(userQuery, function(err, user) {
      if(err) {
        console.log('Database error getting user by username or id:');
        return res.status(500).json({error: true, msg: 'database error'});
      }
      if(!user || user.length === 0) {
        console.log('Tried to get user. User could not be found by: ', userQuery, '. User is: ', user);
        return res.status(204).json({error: false, msg: 'no user found', user: {} });
      }

      console.log("USER FOUND: ", user);
      res.json({
        username:  user[0].username,
        email:     user[0].email,
        userId:    user[0]._id,
        status:    user[0].status,
        role:      user[0].role,
        confirmed: user[0].confirmed
      });
    });
  });

  // Get users (requires login & Admin authorization role)
  router.get('/users', eatOnReq, eatAuth, adminAuth, function(req, res) {
    User.find({}, function(err, users) {
      if (err) {
        console.log('Error finding user. Error: ', err);
        return res.status(500).json({ error: 'user not found' });
      }
      res.json({users: users});
    });
  });

  // Create new user
  router.post('/users', function(req, res) {
    var newEmail = req.body.email;
    var newUser = new User({  // Explicitly populate to avoid exploit
      // username: req.body.username,
      email: newEmail
    });

    if(!newEmail || !EMAIL_REGEX.test(newEmail)) {
      return res.status(400).json({error: 'email'});
    }

    // Validate Email is not Duplicate
    User.findOne({email: newEmail}, function(err, match) {
      if(err) { throw 'database error' };
      if(match) {  // match found - email TAKEN!
        console.log("VALIDATING EMAIL - NO USER FOUND WITH SAME EMAIL - OK!");
        return respond400ErrorMsg(res, 'email-taken');
      }

      // No match, continue
      newUser.generateHash(req.body.password, function(err, hash) {
        if (err) { return res.status(500).json({ error: true }); }
        newUser.auth.basic.password = hash;
        newUser.status = 'P';   // pending

        newUser.save(function(err, user) {
          if (err) { console.log('Error creating user. Error: ', err); }
          switch(true) {
            case !!(err && contains(err.errmsg, 'E11000')):
              return res.status(400).json({ error: 'username'  });
            case !!(err && contains(err.errmsg, '.email')):
              return res.status(400).json({ error: 'email'     });
            case !!(err):
              return res.status(400).json({ error: true        });
          }

          console.log("ABOUT TO GO INTO SEND EMAIL SECTION...");
          // Generate confirmation token & send email (ASYNC)
          Utils.generateUrlSafeTokenAndHash(function(errr, urlSafeToken, tokenHash) {
            user.confirmed = tokenHash;
            user.save();

            console.log("USER SAVED, NOW TO SEND EMAIL...");
            // Send confirmation email
            var mailOptions = {
              from:    'Syynpost Confirmation <syynpost@gmail.com>',
              to:      user.email,      // User-provided basic-auth email
              subject: 'Syynpost Confirmation',
              html: EmailBuilder.confirmation.buildHtmlEmailString({confirmationToken: urlSafeToken, email: user.email, host: req.headers.origin}),
              // text: EmailBuilder.buildPasswordResetPlainTextEmailString(),
            };
            MailService.sendEmail(mailOptions, function(errrr, result){
              console.log("RESULT OF SENDING EMAIL IS: ", result);
            });
          });

          // Generate & send auth info to the UI (ASYNC)
          user.generateToken(process.env.AUTH_SECRET, function(err, eat) {
            if(err) {
              console.log(err);
              return res.status(500).json({ error: 'login' });
            }
            console.log("EAT FOUND IS: ", eat);
            res.json({
              eat:      eat,  // encrypted version (user.eat is raw)
              username: user.username,
              role:     user.role,
              email:    user.email,
              userid:   user._id });
          });
        });
      });
    });
  });

  // Update user
  router.patch('/users/:id', eatOnReq, eatAuth, ownerAuth('id'), function(req, res) {
    console.log("BODY ON UPDATE REQUEST IS: ", req.body);
    var updSettings = req.body.userSettings;
    var updUserData = {
      username: updSettings.username,
      email:    updSettings.email,
    }

    var userId = updSettings.userId;
    console.log("ABOUT TO UPDATE USER... Current user is: ", updUserData);
    verifyAvailabilityAndUpdateUser(userId, updUserData);


    // ------------- Helper Methods ---------------
    // Validation doesn't always work, and neither do these checks. With both, works better.
    function verifyAvailabilityAndUpdateUser(userId, userData) {
      switch(true) {
        case(!userData.email):                    return respond400ErrorMsg(res, 'email missing');
        case(!EMAIL_REGEX.test(userData.email)):  return respond400ErrorMsg(res, 'email-format');
        case(!userData.username):                 return respond400ErrorMsg(res, 'username missing');
        case(!Utils.isUsernameAllowed(userData.username)): return respond400ErrorMsg(res, 'username-invalid');
      }

      // See if user already taken
      User.findOne({username: userData.username}, function(error, user) {
        if(error) {
          console.log("Error checking username for availability: ", error);
          return res.status(500).json({error: true});
        }
        // Check if user found & NOT the same user
        if(user && (user._id.toString() !== userId.toString()) ) {
          console.log("Username has already been used: ", userData.username);
          return respond400ErrorMsg(res, 'username-taken');
        }

        // See if email already taken
        User.findOne({email: userData.email}, function(err, usr) {
          if(err) {
            console.log("Error checking email for availability: ", error);
            return res.status(500).json({error: true});
          }
          // Check if user found & NOT the same user
          if(user && (user._id.toString() !== userId.toString()) ) {
            console.log("Email has already been used: ", userData.email);
            return respond400ErrorMsg(res, 'email-taken');
          }
          // All clear, continue...
          updateUser(userId, userData);
        });
      });

      // function respond400ErrorMsg(res, errorMsg) {
      //   console.log('Error in settings data. Sending 400 msg: ', errorMsg);
      //   return res.status(400).json({error: true, msg: errorMsg});
      // }
    }

    function updateUser(userId, userData) {
      console.log("ID TO UPDATE IS: ", req.user._id);
      console.log("USER DATA PRIOR TO UPDATE IS: ", userData);
      User.findById(userId, function(error, user) {
        if (error) {
          console.log('Error finding user. Error: ', error);
          return res.status(500).json({ error: true });
        }

        Object.keys(userData).forEach(function(userSetting) {
          user[userSetting] = userData[userSetting];
          user.markModified(userSetting);
        });

        console.loc("USER PRIOR TO SAVE IS: ", user);
        user.save(function(err, usr) {
          if (err) { console.log('Error updating user. Error: ', err); }
          switch(true) {
            // Username uniqueness error
            case !!(err && err.code === 11000 && err.message.includes('username')):  // unique validation
              return respond400ErrorMsg(res, 'username-taken');
            // Email uniqueness error
            case !!(err && err.code === 11000 && err.message.includes('email')):  // unique validation
              return respond400ErrorMsg(res, 'email-taken');
            case !!(err):
              return res.status(500).json({ error: true });
          }

          console.log("User returned from save is: ", usr);
          return res.json({ success: true,
                     user: {username:  usr.username,
                            email:     usr.email,
                            userId:    usr._id,
                            status:    usr.status,
                            role:      usr.role,
                            confirmed: usr.confirmed}
                 });
        });
      })
      // User.findByIdAndUpdate(
      //   userId,                            // id to find
      //   {$set: userData},                  // values to update
      //   {runValidators: true, new: true},  // mongoose options
      //   function(err, user) {              // callback
      //     if (err) { console.log('Error updating user. Error: ', err); }
      //     switch(true) {
      //       // Username uniqueness error
      //       case !!(err && err.code === 11000 && err.message.includes('username')):  // unique validation
      //         return respond400ErrorMsg(res, 'username-taken');
      //       // Email uniqueness error
      //       case !!(err && err.code === 11000 && err.message.includes('email')):  // unique validation
      //         return respond400ErrorMsg(res, 'email-taken');
      //       case !!(err):
      //         return res.status(500).json({ error: true });
      //     }
      //     user.save(function(errr, usr) {      /// REMOVE THIS REDUNDANT SAVE IF CAN!!!
      //       console.log("Updated user is: ", usr);
      //       res.json({ success: true,
      //                  user: {username:  usr.username,
      //                         email:     usr.email,
      //                         userId:    usr._id,
      //                         status:    usr.status,
      //                         role:      usr.role,
      //                         confirmed: usr.confirmed}
      //              });
      //     });
      //   }
      // );
    }
  });

  // Destroy User (soft destroy)
  router.delete('/users/:_id', eatOnReq, eatAuth, ownerAuth('_id'), function(req, res) {
    var delUser;

    delUser = req.user;
    delUser.deleted = Date.now();
    delUser.save(function(err) {
      if (err) {
        console.log("Error saving deletion of user. Error: ", err);
        return res.status(500).json({ error: true, msg: 'error deleting user' });
      }
      res.json({ success: true });
    });
  });

  function respond400ErrorMsg(res, errorMsg) {
    console.log('Error in settings data. Sending 400 msg: ', errorMsg);
    return res.status(400).json({error: true, msg: errorMsg});
  }
};

















