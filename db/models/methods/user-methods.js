'use strict';
/*
 * This set of methods relates to the User model
 * Many of these methods are use with authentication aspects of a user's account
 *
*/

var bcrypt    = require('bcrypt'         );
var Eat       = require('eat'            );
var User      = require('../User.js'     );
var crypto    = require('crypto'         );
var Utils     = require('../lib/utils.js');
var ValidationError = {};  // mongoose.Error.ValidationError;
var ValidatorError  = {};  // mongoose.Error.ValidatorError;



module.exports = {
  generateHash: generateHash,
  checkPassword: checkPassword,
  generateToken: generateToken,
  invalidateToken: invalidateToken,
  isPasswordResetTokenExpired: isPasswordResetTokenExpired
}


