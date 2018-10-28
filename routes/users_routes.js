'use strict';

var bodyparser   = require('body-parser'      );
var contains     = require('lodash'           ).contains;
var eatOnReq     = require('../lib/routes_middleware/eat_on_req.js');
var eatAuth      = require('../lib/routes_middleware/eat_auth.js'  )(process.env.AUTH_SECRET);
var ownerAuth    = require('../lib/routes_middleware/owner_auth.js');
var adminAuth    = require('../lib/routes_middleware/admin_auth.js');
var MailService  = require('../lib/mailing/mail_service.js');
var EmailBuilder = require('../lib/mailing/email_content_builder.js');
var Utils        = require('../lib/utils.js');
var User         = require('../db/models/index.js').User;
var Sequelize    = require('sequelize');
// relocate this for sharing with password reset function
var EMAIL_REGEX = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

module.exports = function(router) {
  router.use(bodyparser.json());


  // Get user by ID (id)
  router.get('/users/:usernameOrId', eatOnReq, eatAuth, ownerAuth('usernameOrId'), function(req, res) {
    var usernameOrId = req.params.usernameOrId;

    // TODO: If OwnerAuth stays, this must be owner, and already have Owner user at res.user
    console.log("ABOUT TO QUERY USER BY usernameOrId");
    User
      .findOne({where: makeUsernameOrIdQuery(usernameOrId) })
      .then(function(user) {
        if(!user) {
          console.log('Tried to get user. User could not be found by: ', usernameOrId, '. User is: ', user);
          return res.status(204).json({error: false, msg: 'no user found', user: {} });
        }

        console.log("USER FOUND: ", user);
        return res.json({
          username:  user.username,
          email:     user.email,
          userId:    user.id,
          status:    user.status,
          role:      user.role,
          confirmed: user.confirmed
        })
      })
      .catch(function(err) {
        console.log('Database error getting user by username or id:');
        return res.status(500).json({error: true, msg: 'database error'});
      });
  });

  // Get username by user id
  router.get('/users/:id/username', function(req, res) {
    var userId = req.params.id;
    User
      .findById(userId)
      .then(function(user) {
        console.log("USERNAME FOUND FROM USER: ", user);
        res.json({username: user.username});
      })
      .catch(function(err) {
        console.log('error finding user');
        return res.status(500).json({error: true, msg: 'database error'});
      });
  });

  // Create new user
  router.post('/users', function(req, res) {
    var newEmail = req.body.email || 'e@example.com';
    var newName = req.body.username || "toto6"
    var preUser = {  // Explicitly populate to avoid exploit
      username: newName,
      email: newEmail
    };

    if(!newEmail || !EMAIL_REGEX.test(newEmail)) {
      return res.status(400).json({error: 'email'});
    }

    console.log("USER IS: ", User);
    // Validate Email is not Duplicate
    User
      .create(preUser)
      .then( newUser => {
        // console.log("BASE User IS: ", User.prototype);
        // console.log("USER SAVED AS: ", newUser);
        // Generate 1-Way Password Hashi
        console.log("about to generate hash...");
        User.prototype.generateHash(req.body.password, function(err, hash) {
          console.log("hash generated as: ", hash);
          if(!hash) { return res.status(500).json({ error: true }); }

          newUser.setDataValue('password', hash);
          console.log("about to save user....");
          newUser
            .save()
            .then(function(user){

              // TODO: REFACTOR TO ITS OWN HELPER METHOD & USE A CONFIG FOR EMAIL
              // Generate confirmation token & send email (ASYNC)
              console.log("user is now: ", user);
              console.log("ABOUT TO GO INTO SEND EMAIL SECTION...");

              sendEmail(user, req, function(usr) {
                // Generate & send auth info to the UI (ASYNC)
                // TODO: REFACTOR TO ABSTRACT AWAY THIS METHOD
                console.log("generating eat token....");
                User.prototype.generateToken(usr, process.env.AUTH_SECRET, function(err, encryptedToken) {
                  console.log("token generated as: ", encryptedToken);
                  if(err) {
                    console.log("ERROR GENERATING TOKEN: ", err);
                    return res.status(500).json({ error: 'login' });
                  }
                  console.log("EAT FOUND IS: ", encryptedToken);
                  res.json({
                    eat:      encryptedToken,  // NOTE: encrypted version (usr.eat is RAW)
                    username: usr.username,
                    role:     usr.role,
                    email:    usr.email,
                    userId:   usr.id });  // TODO: This seems like it should be userId, not userid (all LC). If doesn't work, flip back! Remove this comment if works.
                });
              });
            })
            .catch(error => {
              console.log('Error creating user. Error: ', err);
              res.status(400).json({ error: true  });
            });
        });
      })
      .catch(error => {
        console.log("ERROR SAVING USER!");  // TODO: WHEN THERE ARE DUPLICATE USERS, THIS WILL BE HIT GENERICALLY. FIX THAT FOR BETTER FEEDBACK TO UI.
        return respond400ErrorMsg(res, 'create-user');
      });
  });


  // Update user
  router.patch('/users/:id', eatOnReq, eatAuth, ownerAuth('id'), function(req, res) {
    console.log("BODY ON UPDATE REQUEST IS: ", req.body);
    // TODO: this should NOT be userSettings on the body, it should be updated USER object
    var reqUser = req.body.userUpdates;
    console.log("reqUser is: ", reqUser);
    // Restrict fields allowed to be updated
    var allowedUpdates = {
      username: reqUser.username,
      email:    reqUser.email,
    }

    var userId = reqUser.userId;
    console.log("ABOUT TO UPDATE USER... Updates are: ", allowedUpdates);
    verifyAvailabilityAndUpdateUser(userId, allowedUpdates);


    // ------------- Helper Methods ---------------
    function verifyAvailabilityAndUpdateUser(userId, userUpdates) {
      // Initial validations (avoid waiting for errors)
      switch(true) {
        case(!userUpdates.email):                    return respond400ErrorMsg(res, 'email missing');
        case(!EMAIL_REGEX.test(userUpdates.email)):  return respond400ErrorMsg(res, 'email-format');
        case(!userUpdates.username):                 return respond400ErrorMsg(res, 'username missing');
        case(!Utils.isUsernameAllowed(userUpdates.username)): return respond400ErrorMsg(res, 'username-invalid');
      }

      // NOTE: If becomes a perf issue, can separate queries to reduce calls. Not a heavy traffic route.
      // See if username already taken
      // TODO: THIS SHOULD FIND ALL USERS & VERIFY ONLY ONE --AND-- THAT IT'S SAME
      User
        .findAll({where: {username: userUpdates.username}})
        .then(function(users) {
          // if only one, may be self
          if(users && users.length > 0) {
            if(users.length > 1) {
              console.log("Username has already been used: ", userUpdates.username);
              return respond400ErrorMsg(res, 'username-taken');
            }
            // Check if user found & NOT the same user
            if(users[0] && (users[0].id.toString() !== userId.toString()) ) {
              console.log("Username has already been used: ", userUpdates.username);
              return respond400ErrorMsg(res, 'username-taken');
            }
          }

          // See if email already taken
          User
            .findAll({where: {email: userUpdates.email}})
            .then(function(usrs) {
              // if only one, may be self
              if(usrs && usrs.length > 0) {
                if(usrs.length > 1) {
                  console.log("Email has already been used: ", userUpdates.email);
                  return respond400ErrorMsg(res, 'email-taken');
                }
                // Check if user found & NOT the same user
                if(usrs[0] && (usrs[0].id.toString() !== userId.toString()) ) {
                  console.log("Email has already been used: ", userUpdates.email);
                  return respond400ErrorMsg(res, 'email-taken');
                }
              }

              // All clear, continue...
              updateUser(userId, userUpdates);
            })
            .catch(function() {
              console.log("Error checking email for availability: ", error);
              return res.status(500).json({error: true});
            });
        })
        .catch(function(error) {
          console.log("Error checking username for availability: ", error);
          return res.status(500).json({error: true});
        });
    }

    function updateUser(userId, userData) {
      console.log("ID TO UPDATE IS: ", req.user._id);
      console.log("USER DATA PRIOR TO UPDATE IS: ", userData);
      User
        .findById(userId)
        .then(function(user) {
          // userData is just the "allowedUpdates" object above
          Object.keys(userData).forEach(function(allowedUpdate) {
            user.setDataValue(allowedUpdate, userData[allowedUpdate]);
          });

          console.log("USER PRIOR TO SAVE IS: ", user);
          user
            .save()
            .then(function(usr) {
              console.log("User returned from save is: ", usr);
              return res.json({ success: true,
                         user: {username:  usr.username,
                                email:     usr.email,
                                userId:    usr.id,
                                status:    usr.status,
                                role:      usr.role,
                                confirmed: usr.confirmed}
              });
            })
            .catch(function(err) {
              console.log('Error updating user. Error: ', err);
              return respond400ErrorMsg(res, 'error saving user');
            });
        })
        .catch(function(error) {
          console.log('Error finding user. Error: ', error);
          return res.status(500).json({ error: true });
        });
    }
  });

  function makeUsernameOrIdQuery(usernameOrId) {
    let query = {};
    try      { query['id'] = parseInt(usernameOrId, 10); }
    catch(e) { query['username'] =  usernameOrId; }

    console.log("Query for usernameOrId is: ", query);
    return query;
  }

  function respond400ErrorMsg(res, errorMsg) {
    console.log('Error in data. Sending 400 msg: ', errorMsg);
    return res.status(400).json({error: true, msg: errorMsg});
  }

  // Fire & forget, except logging
  function sendEmail(user, req, callback) {
    Utils.generateUrlSafeTokenAndHash(function(errr, urlSafeToken, tokenHash) {
      user.setDataValue('confirmed', tokenHash);

      user
        .save()
        .then(function(usr) {
          console.log("USER SAVED, NOW TO SEND EMAIL...");
          // Send confirmation email
          var mailOptions = {
            from:    'SIGNUP Confirmation <info@SOME-APP.com>',
            to:      user.email,      // User-provided basic-auth email
            subject: 'SIGNUP Confirmation',
            html: EmailBuilder.confirmation.buildHtmlEmailString({confirmationToken: urlSafeToken, email: user.email, host: req.headers.origin}),
            // text: EmailBuilder.buildPasswordResetPlainTextEmailString(),
          };
          MailService.sendEmail(mailOptions, function(errrr, result){
            console.log("RESULT OF SENDING EMAIL IS: ", result);
          });

          callback(user);
        });
    });
  }
};
