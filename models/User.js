'use strict';

var bcrypt   = require('bcrypt-nodejs');
var eat      = require('eat'          );
var mongoose = require('mongoose'     );
var crypto   = require('crypto'       );

// db schema for User
var UserSchema = mongoose.Schema({
  auth: {
    basic: {
      password:             { type: String,   default: null },
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
  confirmed:       { type: Boolean,  default: false                   },
  eat:             { type: String,   default: null                    },
  email:           { type: String,   default: null                    },
  permissions:     { type: Array,    default: ['user']                },
  prt:             { type: String,   default: null                    },  // HOOK THIS UP TO EMAIL
  role:            { type: String,   default: null                    },
  status:          { type: String,   default: 'A'                     },  // A=Active, D=Deleted, P=Pending, S=Suspended
  termsconditions: { type: Date,     default: null                    },
  updated_at:      { type: Date,     default: Date.now                },
  username:        { type: String,   match: /^[a-zA-Z0-9_-]*$/        },

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
UserSchema.path('email'   ).index( { unique: true } );


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

UserSchema.pre('save', function(next) {
  this.udpated_at = Date.now();
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
  this.eat = crypto.randomBytes(32).toString('hex');
  console.log("CRYPTO GENERATED EAT IS: ", this.eat);

  this.save(function(err, user) {
    if (err) {
      console.log('Error creating new token. Error: ', err);
      return callback(err, null);
    }

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


// Export mongoose model/schems
module.exports = mongoose.model('User', UserSchema);
