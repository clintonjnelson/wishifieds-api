'use strict';

var bodyparser   = require('body-parser'      );
var contains     = require('lodash'           ).contains;
var eatOnReq     = require('../lib/routes_middleware/eat_on_req.js');
var eatAuth      = require('../lib/routes_middleware/eat_auth.js'  )(process.env.AUTH_SECRET);
var ownerAuth    = require('../lib/routes_middleware/owner_auth.js');
var MailService  = require('../lib/mailing/mail_service.js');
var EmailBuilder = require('../lib/mailing/email_content_builder.js');
var userMappers  = require('../lib/model_mappers/user_mapper.js');
var Utils        = require('../lib/utils.js');
var db           = require('../db/models/index.js');
var User         = db.User;
var Badge        = db.Badge;
var Images       = db.Image;
var Locations    = db.Location;
var UserLocation = db.UserLocation;
// var Sequelize    = require('sequelize');
var sequelize    = db.sequelize;
var multer       = require('multer');
var uuid         = require('uuid/v4');
var multerS3 = require('multer-s3');
var s3Utils = require('../lib/s3Utils.js');
var s3AvatarUpload = multer({
  storage: multerS3({
    s3: s3Utils.defaultS3(),
    bucket: process.env.WISHIFIEDS_AVATARS_S3BUCKET,
    acl: 'public-read',
    metadata: function(req, file, metaCallback) {
      metaCallback(null, {fieldName: file.fieldname});  // TODO: Update this for userul stuff
    },
    key: function(req, file, keyCallback) {
      console.log("FILE in KEY is: ", file);
      var imageToken = uuid();
      var baseKeyName = 'images/' + imageToken + '.';  // TODO: CHANGE THIS TO A SAVABLE TOKEN!
      var fileExtension = s3Utils.getImageExtension([file.filename, file.originalname]);
      var bucketKeyName = baseKeyName + fileExtension;
      keyCallback(null, bucketKeyName);
    },
  })
});  // TEMP FOR MULTER TESTING

// relocate this for sharing with password reset function
var EMAIL_REGEX = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
const DEFAULT_AVATAR_URL = '/assets/profile_default.png';
const DEFAULT_ZIPCODE = '98101';

module.exports = function(router) {

  // Upload/Update User Avatar (including saving uploaded file in S3)
  router.post('/users/:id/profile_pic',
    eatOnReq,
    eatAuth,
    bodyparser.urlencoded({ extended: true }),
    s3AvatarUpload.single('avatar'),
    function(req, res) {
      console.log("USER ON REQ IS: ", req.user);
      console.log("SUCCESSFULLY UPLOADED TO S3. NOW NEED TO SAVE TOKEN FILE NAME LOCALLY!!");
      console.log("Body is: ", req.body);
      console.log("File IS: ", req.file);
      var userId = req.user.id;
      var s3ImageUrl = req.file.location;

      console.log("About to update the user with new avatar URL.", userId);
      updateUserAvatar(userId, s3ImageUrl, function(err, savedUser) {
        if(err) {
          return res.status(500).json({error: true, message: 'Error saving/updating avatar image.'});
        } else {
          return res.json({error: false, user: userMappers.mapUser(savedUser)});
        }
      });
  });


  // Below routes all use bodyparser, but above routes conflict with it
  router.use(bodyparser.json());


  // Get user by ID (id)
  router.get('/users/:usernameOrId', eatOnReq, eatAuth, ownerAuth('usernameOrId'), function(req, res) {
    var usernameOrId = req.params.usernameOrId;

    // TODO: If OwnerAuth stays, this must be owner, and already have Owner user at res.user
    console.log("ABOUT TO QUERY USER BY usernameOrId");
    User
      .findOne({
        where: makeUsernameOrIdQuery(usernameOrId),
        include: [{
          model: Badge,
          where: { status: 'ACTIVE' },
          required: false
        }],
      })
      .then(function(user) {
        if(!user) {
          console.log('Tried to get user. User could not be found by: ', usernameOrId, '. User is: ', user);
          return res.status(204).json({error: false, msg: 'no user found', user: {} });
        }

        console.log("USER AND BADGES FOUND: ", user);
        return res.json(userMappers.mapUser(user, user.Badges));  // FIXME: return {data:...} or {user:...}. Not raw object
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

  // GET profile_pic for a requested user id
  // TODO: Maybe get off of normal user route, but with special flag specifying fields?
  router.get('/users/:id/profile_pic', eatOnReq, eatAuth, function(req, res) {
    var profileUserId = req.params.id;
    User
      .findOne({
        where: { id: profileUserId },
        raw: true
      })
      .then(function(foundUser) {
        if(!foundUser) {
          console.log("Could not find profile pic url for user with ID: ", profileUserId);
          return res.status(404).json({error: true, msg: 'no profile pic url found for user'});
        }

        console.log("AVATAR FOUND FOR USER: ", foundUser.profilePicUrl);
        res.json({error: false, profilePicUrl: foundUser.profilePicUrl});
      })
      .catch(function(err) {
        console.log('Error finding user for id: ', profileUserId);
        return res.status(500).json({error: true, msg: 'database error'});
      });
  });

  // Create new user
  router.post('/users', function(req, res) {
    console.log("REQ BODY IS: ", req.body);
    if(!req.body.termsCond) {
      return res.status(403).json({ error: true, msg: 'terms-cond'  });  // not agree? Forbidden. Sorry.
    }

    var newEmail = req.body.email;
    var newName = req.body.username || newEmail.split('@')[0]; // TODO: need a username generator here
    var dataConsentDate = req.body.dataConsentDate || new Date().toISOString();
    var preUser = {  // Explicitly populate to avoid exploit
      username: newName,
      email: newEmail,
      profilePicUrl: DEFAULT_AVATAR_URL,
      dataConsentDate: dataConsentDate,
    };

    if(!newEmail || !EMAIL_REGEX.test(newEmail)) {
      return res.status(400).json({error: 'email'});
    }

    console.log("USER IS: ", preUser);
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
              // User saved, set user's default location
              // TODO: Should probably wrap this in a transaction with User creation...
              console.log("about to save the new default user location...");
              UserLocation
                .create({
                  userId: user.id,
                  locationId: 38512,
                  description: 'Default',
                    // {[Sequelize.Op.eq]: sequelize.literal('(SELECT id FROM public.locations WHERE postal=\'' + DEFAULT_ZIPCODE + '\' LIMIT 1;)')}
                })
                .then(function(userLoc){
                  console.log("UserLocation saved as: ", userLoc);
                  console.log("about to save the default user location to the user...");
                  user.setDataValue('defaultUserLocation', userLoc.id)
                  user.save()
                    .then(function(savedUser){
                      console.log('UserLocation saved to User: ', savedUser);
                    });
                })
                .catch(function(err) {
                  console.log("Error saving UserLocation: ", err);
                });

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
                  res.json( userMappers.mapUserSession(usr, encryptedToken) );  // TODO: This seems like it should be userId, not userid (all LC). If doesn't work, flip back! Remove this comment if works.
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
      // TODO: ABILITY TO SET BACK THE PROFILE PIC URL (avatar) to DEFAULT_AVATAR_URL
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
              return res.json({ success: true, user: userMappers.mapUser(usr) });
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

  // GET profile_pic for a requested user id
  // TODO: Maybe get off of normal user route, but with special flag specifying fields?
  router.delete('/users/:userId/badges/:badgeType', eatOnReq, eatAuth, function(req, res) {
    const userId = req.params['userId'];
    var badgeType;
    try { badgeType = req.params['badgeType'].toUpperCase(); }
    catch(e) {
      console.log("Error deleting user badge. BadgeType not specified. Error: ", error);
      return res.status(400).json({error: true, msg: 'badge-type-required'});
    }

    Badge
      .destroy({ where: { userId: userId, badgeType: badgeType }})
      .then(function(deletedBadge) {
        console.log("Deleted the badge! Response is: ", deletedBadge);

        return res.json({error: false, msg: 'success'});
      })
      .catch(function(err) {
        console.log('Error deleting', badgeType, ' badge for user: ', userId);
        return res.status(500).json({error: true, msg: 'database error'});
      });
  });

  // TODO: THIS ROUTE HAS NOT BEEN VERIFIED AS FUNCTIONAL YET!
  router.get('/users/:usernameOrId/badges', eatOnReq, eatAuth, function(req, res){
    const userId = req.params['userId'];
    if(!userId) { return res.status(400).json({error: true, msg: 'no-user'}); }

    Badge
      .findAll({where: {userId: userId} })
      .then(function(badges) {
        if(!badges || badges.length < 1) {
          return res.json({success: true, badges: []});
        }

        console.log("Badges found: ", badges);
        return res.json({
          success: true,
          badges: badges.map(b => { return { badgeType: b['badgeType'], linkUrl: b['linkUrl'] } })
        });
      });
  });

//--------------------- HELPERS ------------------------
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

  function updateUserAvatar(userId, avatarImageUrl, callback) {
    User
      .findById(userId)
      .then(function(foundUser) {
        console.log("User found. Found user is : ", foundUser, " Updating with image url: ", avatarImageUrl);
        foundUser.setDataValue('profilePicUrl', avatarImageUrl);
        foundUser
          .save()
          .then(function(savedUser) {
            console.log("User saved. Saved user is now: ", savedUser);
            callback(null, savedUser);
          })
          .catch(function(errr) {
            console.log("Error saving user's updated profile pic url. Error: ", errr);
            callback(errr, null);
          });
      })
      .catch(function(err) {
        console.log("Error gettng user by ID so could save the new avatar. Error: ", err);
        callback(err, null);
      });
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

          callback(usr);
        });
    });
  }
};

// Saving Images in S3 Using plugins
  // Save the token
  // Save the file extension
  // Save the URL
  // Save the original file name
  // { fieldname: 'avatar',
    // originalname: 'profile.png',
    // encoding: '7bit',
    // mimetype: 'image/png',
    // size: 1286,
    // bucket: 'wishifieds-avatars',
    // key: 'images/7f5cd593-f429-4c88-8339-8f89d164a3c7.png',
    // acl: 'public-read',
    // contentType: 'application/octet-stream',
    // contentDisposition: null,
    // storageClass: 'STANDARD',
    // serverSideEncryption: null,
    // metadata: { fieldName: 'avatar' },
    // location: 'https://wishifieds-avatars.s3.us-west-2.amazonaws.com/images/7f5cd593-f429-4c88-8339-8f89d164a3c7.png',
    // etag: '"38a3f764e52a95120502dd9b233fbb93"',
    // versionId: undefined }
