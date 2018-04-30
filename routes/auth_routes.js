'use strict';

var bodyparser  = require('body-parser');
var eatOnReq    = require('../lib/routes_middleware/eat_on_req.js');
var eatAuth     = require('../lib/routes_middleware/eat_auth.js')(process.env.AUTH_SECRET);
var EMAIL_REGEX = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
var MailService = require('../lib/mailing/mail_service.js');
var EmailBuilder = require('../lib/mailing/email_content_builder');
var Utils       = require('../lib/utils.js');
// TODO: UPDATE THIS MODEL TO USE SEQUELIZE
var User        = {};

module.exports = function(router, passport) {
  router.use(bodyparser.json());

  // Send User Info IF logged in
  router.get('/login/user', eatOnReq, eatAuth, function(req, res) {
    res.json({
      eat:      req.eat,
      username: user.username,
      userId:   user._id,
      email:    user.email,
      role:     user.role
    });
  });

  // Existing user login
  router.get('/login', function(req, res, next) {
    console.log("IN LOGIN...")
    //passport.authenticate('basic', { session: false })
    passport.authenticate('basic', function(error, user, info) {
      console.log("AUTHENTICATING WITH BASIC...")
      if(error) {
        console.log('Error in basic auth. Error: ', error);
        return res.status(400).json({ error: true, msg: error});
      }
      if(!user) {
        console.log('Error in getting user. User is: ', user);
        return res.status(404).json({ error: true, msg: 'user not found'});
      }

      user.generateToken(process.env.AUTH_SECRET, function(err, eat) {  // passport strat adds req.user
        if (err) {
          console.log('Error logging in user. Error: ', err);
          return res.status(404).json({ error: true, msg: 'error logging in' });
        }
        res.json({
          eat:      eat,
          username: user.username,
          userId:   user._id,
          email:    user.email,
          role:     user.role
        });
      });
    })(req, res, next);
  });

  // User signout
  router.get('/logout', eatOnReq, eatAuth, function(req, res) {
    req.user.invalidateToken(function(err, result) {
      if (err) { return res.status(500).json({ error: true }); }

      res.json({ success: true });
    });
  });


  // ------------------- Password Reset Routes -------------------

  // Password Reset
  router.get('/passwordresetrequest', function(req, res) {
    var passwordResetEmail = req.query.email && req.query.email.trim();  // if exists, trim whitespace
    console.log("EMAIL RECEIVED IS: ", passwordResetEmail);
    console.log("RESULT OF TEST EMAIL IS: ", EMAIL_REGEX.test(passwordResetEmail));

    // Verify user exists from email requested
    User.findOne({email: passwordResetEmail}, function(error, user) {
      if(error || !user) {
        console.log('Could not find user by email: ', email);
        return res.status(404).json({error: true, msg: 'email-not-found'});
      }
      console.log("USER FOUND FOR PASSWORD RESET IS: ", user);

      // User found => generate password reset token & hash
      Utils.generateUrlSafeTokenAndHash(function(err, resetToken, tokenHash) {
        if(err) {
          console.log("Error generating token & hash for password reset. Error is: ", err);
          return res.status(500).json({error: true, msg: 'error-generating-reset'});
        }

        // Add hash & expiration to user's PasswordResetInfo
        user.auth.basic.passwordReset.tokenHash  = tokenHash;
        user.auth.basic.passwordReset.expiration = Utils.expirationDateHoursFromNow(2)
        user.save();

        // configure mail for sending
        var mailOptions = {
          from:    'Syynpost Password Reset <info@syynpost.com>',
          to:      user.email,   // Email provided by user
          subject: 'Syynpost Password Change Request',
          html: EmailBuilder.passwordReset.buildHtmlEmailString({ resetToken: resetToken, email: user.email, host: req.headers.origin }),
          // text: EmailBuilder.buildPasswordResetPlainTextEmailString(),
        };

        MailService.sendEmail(mailOptions, function(errr, result) {
          if(errr) {
            console.log("Error sending email: ", errr);
            return res.status(500).json({error: true, msg: 'email-failure'});
          }

          console.log('Email sent with result of: ', result);
          res.json({success: true});
        });

      });
    });
  });

  // Password Change with Token
  router.put('/resetpassword', function(req, res) {
    console.log("MADE IT TO PASSWORD RESET WITH BODY: ", req.body);
    var email      = req.body.email;
    var resetToken = req.body.resetToken;
    var password   = req.body.password;

    if(!email || !resetToken || !password) {
      console.log("DATA MISSING FROM REQUEST");
      return res.status(400).json({error: true, msg: 'invalid-info'});
    }

    // First find user from email
    User.findOne({email: email}, function(err, user) {
      if(err || !user) {
        console.log('Could not find user by email: ', email);
        return res.status(404).json({error: true, msg: 'email-not-found'});
      }

      // Token expired?
      if(user.isResetTokenExpired()) {
        console.log('Password reset token has already expired.');
        return res.status(400).json({error: true, msg: 'reset-token-expired'});
      }

      // User found & token not expired => check token
      user.checkPasswordResetToken(resetToken, function(errr, result) {
        // Error or match failed
        if(errr || !result) {
          console.log('Token did not match when hashed. Password reset aborted.');
          return res.status(400).json({error: true, msg: 'reset-token-invalid'});
        }

        // Token matched => allow password reset
        user.generateHash(password, function(errrr, hash) {
          if(errrr || !hash) {
            console.log('Password could not be hashed. Password reset aborted.');
            return res.status(500).json({error: true, msg: 'password-reset-failed'});
          }

          user.auth.basic.password = hash;
          user.auth.basic.passwordReset.expiration = Utils.generateInvalidTimestamp();

          // Save user password & clear out reset info
          user.save(function(errrrr, updatedUser) {
            if(errrrr || !updatedUser) {
              console.log('User could not be saved with new password. Password reset aborted.');
              return res.status(500).json({error: true, msg: 'password-reset-failed'});
            }

            // User saved => Login user & pass back login info
            console.log("SAVED USER IS: ", updatedUser);
            updatedUser.generateToken(process.env.AUTH_SECRET, function(errrrrr, eat) {
              res.json({success: true,
                        user: { eat:      eat,
                                username: updatedUser.username,
                                userId:   updatedUser._id,
                                email:    updatedUser.email,
                                role:     updatedUser.role }
                      });
            });
          });
        });
      });
    });
  });

  router.get('/auth/resendconfirmation', eatOnReq, eatAuth, function(req, res) {
    console.log("MADE IT TO RESEND CONFIRMATION WITH REQ.QUERY: ", req.query);
    var userId = req.query['id'];

    User.findById(userId, function(error, user) {
      if(error || !user) {
        console.log("Error finding user by ID: ", error);
        return res.status(404).json({error: true, msg: 'invalid-user'});
      }
      if(!user.email) {
        console.log('Error: User has no email to send confirmation to.');
        return res.status(404).json({error: true, msg: 'missing-email'});
      }

      console.log("ABOUT TO GO INTO SEND EMAIL SECTION...");
      // Generate confirmation token & send email (ASYNC)
      Utils.generateUrlSafeTokenAndHash(function(err, urlSafeToken, tokenHash) {
        if(err) {
          console.log('Error creating token & hash for resending confirmation.');
          return res.status(500).json({error: true, msg: 'confirmation-resend-error'});
        }

        user.confirmed = tokenHash;
        user.save();

        console.log("USER SAVED, NOW TO SEND EMAIL...");
        // Send confirmation email
        var mailOptions = {
          from:    'Syynpost Confirmation <info@syynpost.com>',
          to:      user.email,      // User-provided basic-auth email
          subject: 'Syynpost Confirmation',
          html:    EmailBuilder.confirmation.buildHtmlEmailString({confirmationToken: urlSafeToken, email: user.email, host: req.headers.origin}),
          // text: EmailBuilder.buildPasswordResetPlainTextEmailString(),
        };

        MailService.sendEmail(mailOptions, function(errr, result){
          if(errr || !result) {
            console.log('Error sending email. Error is: ', errr, '. Result is: ', result);
            return res.status(500).json({error: true, msg: 'mail-resend-failure'});
          }
          console.log("RESULT OF SENDING EMAIL IS: ", result);
          res.json({success: true});
        });
      });
    });
  });

  router.get('/auth/emailconfirmation', function(req, res) {
    console.log("MADE IT TO EMAIL CONFIRMATION ROUTE. QueryParams are", req.query);
    console.log("CONFRIMATION EMAIL REQUEST IS: ", req);
    var confirmationToken = req.query['confirmationtoken'];
    var email             = req.query['email'];

    if(!confirmationToken || !email) {
      console.log('No token provided for email confirmation');
      return res.status(400).json({error: true, msg: 'missing-token'});
    }

    // Find user by email
    User.findOne({email: email}, function(error, user) {
      if(error) {
        console.log('Error finding user from email. Error: ', error, '. User: ', user);
        return res.status(400).json({error: true, msg: 'invalid-email'});
      }

      // User found => now compare token to user's confirmation hash
      Utils.checkUrlSafeTokenAgainstHash(confirmationToken, user.confirmed, function(err, result) {
        if(err || !result) {
          console.log('Error hashing token. Error: ', err, '. Result: ', result);
          return res.status(400).json({error: true, msg: 'invalid-token'});
        }

        // Successful match => confirm user
        user.confirmed = 'true';
        user.status    = 'A';        // Change from 'P' Pending to 'A' Active
        user.save(function(errr, updatedUser) {
          if(errr || !updatedUser) {
            console.log('Error saving user after confirmation. Error: ', errr, '. User: ', updatedUser);
            return res.status(500).json({error: true, msg: 'internal-error'});
          }

          res.json({success: true, username: user.username});
        });
      });
    });
  });
};
