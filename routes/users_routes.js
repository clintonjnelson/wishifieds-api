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
var User         = require('../db/models/index.js').users;
// relocate this for sharing with password reset function
var EMAIL_REGEX = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

module.exports = function(router) {
  router.use(bodyparser.json());

  // Create new user
  router.post('/users', function(req, res) {
    var newEmail = req.body.email || 'e@example.com';
    var newName = req.body.username || "toto5"
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
                    userid:   usr.id });
                });
              });
            })
            .catch(error => {
              console.log('Error creating user. Error: ', err);
              res.status(400).json({ error: true  });
            });
        });
      });
      // .catch(error => {
      //   console.log("ERROR SAVING USER!");
      //   return respond400ErrorMsg(res, 'create-user');
      // });
    });



  function respond400ErrorMsg(res, errorMsg) {
    console.log('Error in settings data. Sending 400 msg: ', errorMsg);
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
