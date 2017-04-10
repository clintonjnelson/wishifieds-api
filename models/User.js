'use strict';

var bcrypt   = require('bcrypt-nodejs');
var eat      = require('eat'          );
var mongoose = require('mongoose'     );
var crypto   = require('crypto'       );
var Utils    = require('../lib/signpost_utils.js');

// db schema for User
var UserSchema = mongoose.Schema({
  auth: {
    basic: {
      password:             { type: String,   default: null },
      passwordReset: {
        tokenHash:  { type: String, default: null},
        expiration: { type: String, default: null}
      }
    },
    facebook: {
      facebookId:           { type: String,   default: null },
      facebookAccessToken:  { type: String,   default: null },
    },
    github: {
      githubId:             { type: String,   default: null },
      githubAccessToken:    { type: String,   default: null },
    },
    google: {
      googleId:             { type: String,   default: null },
      googleAccessToken:    { type: String,   default: null },
    },
    instagram: {
      instagramId:          { type: String,   default: null },
      instagramAccessToken: { type: String,   default: null },
    },
    linkedin: {
      linkedinId:           { type: String,   default: null },
      linkedinAccessToken:  { type: String,   default: null },
    },
    stackexchange: {
      stackexchangeId:          { type: String,   default: null },
      stackexchangeAccessToken: { type: String,   default: null },
    },
    twitter: {
      twitterId:            { type: String,   default: null },
      twitterAccessToken:   { type: String,   default: null },
    },
    wordpress: {
      wordpressId:          { type: String,   default: null },
      wordpressAccessToken: { type: String,   default: null },
    },
                                                                     },
  confirmed:       { type: String,  default: null                    },  // Gets date when confirmed
  eat:             { type: String,  default: null                    },
  email:           { type: String,  default: null, lowercase: true   },  // sparse: true,
  permissions:     { type: Array,   default: ['user']                },
  prt:             { type: String,  default: null                    },  // HOOK THIS UP TO EMAIL
  role:            { type: String,  default: null                    },
  status:          { type: String,  default: 'A'                     },  // A=Active, D=Deleted, P=Pending, S=Suspended
  termsconditions: { type: Date,    default: null                    },
  updatedAt:       { type: Date,    default: Date.now()              },
  createdAt:       { type: Date,    default: Date.now()              },
  username:        { type: String,  match: /^[a-zA-Z0-9_-]*$/, lowercase: true},

  // ObjectId References
  // location_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: false },
});

// Validations
// NEED A CREATE_DATE WITH ON_CREATE HOOK
// ONLY NEED THESE TO BE REQUIRED ON BASIC AUTH!!!
// UserSchema.path('auth.basic.password').required(true);
// UserSchema.path('email'              ).required(true);
UserSchema.path('username').required(true);
UserSchema.path('username').index( { unique: true } );
// UserSchema.path('email'   ).index( { unique: true } );  // REALLY WANT THIS BUT IT WON"T ALLOW NULL VALUES!!!! ARRRRRGHHHH.


//--------------------------------- HOOKS --------------------------------------
UserSchema.pre('validate', function(next) {
  var user = this;
  makeAndValidateUsername(next);

  // Helper functions
  function makeAndValidateUsername(next) {
    console.log("USERNAME IN VALIDATOR IS: ", user.username);
    user.username = user.username || generateUsername();
    user.username = formatUsername(user.username);

    user.constructor.findOne({username: user.username}, function(err, match) {
      if(err)  { throw 'database error'; }
      if(!match || !match.username) {       // no matching user found => NEXT!
        return next();
      }
      if( String(match._id) === String(user._id) ) {
        return next();                      // found itself
      }
      user.username = generateUsername();   // already exists => try again
      makeAndValidateUsername(next);        // recurse to keep async chain
    });
  }

  function generateUsername() {
    var digits = String(Math.floor(Math.random() * 1E12));  // string of 12digits
    while(digits.length < 12) {
      digits += '0';
    }
    return 'signpost' + digits;
  }

  // format: only alphanimeric/dash/underscore, trim, lowercase, max20chars
  function formatUsername(username) {
    username = username.replace(/[^\w]|_|-/g, "");  // remove all but alphanumeric, dash, underscore
    username = username.toLowerCase().trim();
    username = (username.length <= 20 ? username : username.slice(0, 20) );
    return username;
  }
});

UserSchema.pre('validate', function(next) {
  var user = this;
  console.log("VALIDATING EMAIL FOR USER: ", user);
  // Blank email is OK
  if(!user.email) {
    console.log("VALIDATING EMAIL - BLANK EMAIL OK!");
    return next();
  }
  // If has value, ensure NO DUPLICATE
  user.constructor.findOne({email: user.email}, function(err, match) {
    if(err) { throw 'database error' };
    if(!match || !match.email) {  // no matching user found => NEXT!
      console.log("VALIDATING EMAIL - NO USER FOUND WITH SAME EMAIL - OK!");
      return next();
    }
    if(String(match._id) === String(user._id)) {
      console.log("VALIDATING EMAIL - USER FOUND ITSELF - OK!");
      return next();  // found itself
    }

    console.log("VALIDATING EMAIL - USER FOUND ITSELF - OK!");
    user.email = null;
    next();
  });

});

UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});





//------------------------------- USER METHODS ----------------------------------
UserSchema.methods.generateHash = function generateHash(password, callback) {
  bcrypt.genSalt(8, function(err, salt) {
    bcrypt.hash(password, salt, null, function saveHashedPassword(err, hash) {
      if (err) {
        console.log('Error generating hash. Error: ', err);
        return callback(err, null);
      }
      callback(null, hash);
    });
  });
};

UserSchema.methods.checkPassword = function checkPassword(password, callback) {
  bcrypt.compare(password, this.auth.basic.password, function validatePassword(err, res) {
    if (err) {
      console.log('Error checking password. Error: ', err);
      return callback(err, null);
    }
    callback(null, res);  // if failure, res=false. if success, res=true
  });
};

UserSchema.methods.generateToken = function generateToken(secret, callback) {
  this.eat = crypto.randomBytes(24).toString('hex').toString();
  console.log("CRYPTO GENERATED EAT IS: ", this.eat);

  // FOR SOME REASON, SAVE DOESNT ALWAYS WORK WITH OAUTH SIGN SIGN-IN
  this.save(function(err, user) {
    if (err) {
      console.log('Error creating new token. Error: ', err);
      return callback(err, null);
    }
    console.log("AFTER SAVING, EAT IS: ", user.eat, " WHICH SHOULD BE SAME AS THE CRYPTO EAT ABOVE");
    eat.encode({eat: user.eat}, secret, function encodeEat(err, eatoken) {
      if (err) {
        console.log('Error encoding eat. Error: ', err);
        return callback(err, null);
      }
      console.log("ABOUT TO ENCODE THIS TOKEN: ", eatoken);
      var encodedToken = encodeURIComponent(eatoken)
      console.log("NEWLY ENCODED TOKEN IS: ", encodedToken);
      callback(null, encodedToken);
    });
  });
};

UserSchema.methods.invalidateToken = function invalidateToken(callback) {
  this.eat = null;
  this.save(function(err, user) {
    if (err) {
      console.log('Could not save invalidated token. Error: ', err);
      return callback(err, null);
    }
    callback(null, user);
  });
};

UserSchema.methods.isResetTokenExpired = function isResetTokenStillValid() {
  var timestamp = this.auth.basic.passwordReset.expiration;

  return !Utils.isTimestampStillValid(timestamp);
}

UserSchema.methods.checkPasswordResetToken = function checkPasswordResetToken(tokenToCheck, callback) {
  var hash = this.auth.basic.passwordReset.tokenHash;
  Utils.checkUrlSafeTokenAgainstHash(tokenToCheck, hash, callback);
}


// Export mongoose model/schems
module.exports = mongoose.model('User', UserSchema);
