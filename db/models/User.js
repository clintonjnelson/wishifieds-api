'use strict';

var bcrypt    = require('bcrypt'         );
var Eat       = require('eat'            );
var crypto    = require('crypto'         );
var Utils     = require('../../lib/utils.js');


module.exports = function(sequelize, DataTypes) {

  // Models info here: http://sequelize.readthedocs.io/en/1.7.0/docs/models/
  // Table name will match the definition name here
  const User = sequelize.define('User',
  {
    // User properties
    eat:             { type: DataTypes.STRING },
    email:           { type: DataTypes.STRING, unique: true, validate: { isEmail: { args: true, msg: 'email-invalid' } } },
    password:        { type: DataTypes.STRING },
    prt:             { type: DataTypes.STRING },
    prtexpiration:   { type: DataTypes.DATE },
    role:            { type: DataTypes.ENUM('ADMIN', 'USER'), defaultValue: 'USER'},
    username:        { type: DataTypes.STRING, validate: {isAlphanumeric: true, isLowercase: true},
                       unique: true,
                       validate: {
                        validateFormat: function(value) {
                          if(!/^[a-zA-Z0-9_-]*$/.test(value)) {
                            throw new Error("Invalid username format.")
                          }
                        }
                       }
                     },
    phoneId:         { type: DataTypes.INTEGER, unique: true, field: 'phone_id' },
    profilePicUrl:   { type: DataTypes.STRING, field: 'profile_pic_url' },
    defaultUserLocation: { type: DataTypes.INTEGER, field: 'default_user_location', allowNull: true },

    // Checks
    confirmed:       { type: DataTypes.STRING },
    status:          { type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'PENDING'), defaultValue: 'PENDING'},
    termsconditions: { type: DataTypes.BOOLEAN },

    // Timestamps
    createdAt:       { type: DataTypes.DATE, field: 'created_at', allowNull: false },
    updatedAt:       { type: DataTypes.DATE, field: 'updated_at', allowNull: false },
  }, {
    timestamps : true,
    tableName: 'users',
    freezeTableName: true,
    underscored: true
  });

  // Instance Methods
  User.prototype.generateHash = function generateHash(password, callback) {
    bcrypt.genSalt(8, function(err, salt) {
      bcrypt.hash(password, salt, function saveHashedPassword(err, hash) {
        if (err) {
          console.log('Error generating hash. Error: ', err);
          return callback(err, null);
        }
        callback(null, hash);
      });
    });
  };

  User.prototype.checkPassword = function checkPassword(password, user, callback) {
    console.log("Checking password...")
    bcrypt.compare(password, user.password, function validatePassword(err, res) {
      if (err) {
        console.log('Error checking password. Error: ', err);
        return callback(err, null);
      }
      callback(null, res);  // if failure, res=false. if success, res=true
    });
  };

  User.prototype.generateToken = function generateToken(user, secret, callback) {
    // OMG, THIS SET IS PARTIAL MATCHING THE COLUMN NAME!
    // INSTEAD OF UPDATING "eat", IT'S UPDATING "CR-eat-ED_AT". OMG.
    const eat = crypto.randomBytes(24).toString('hex').toString();
    console.log("CURRENT VALUE OF 'eat' is: ", eat);
    user.setDataValue('eat', eat);
    console.log("CURRENT VALUE OF 'user' with EAT Updated: ", user);
    user
      .save()
      .then(savedUser => {
        console.log("AFTER SAVING, savedUser IS: ", savedUser, " WHICH SHOULD HAVE EAT THAT'S SAME AS THE CRYPTO EAT ABOVE");
        console.log("EAT value on user is: ", savedUser.eat);
        // Encode the eat token & return
        Eat.encode({'eat': eat}, secret, function(err, eatToken) {
          if(err) {
            console.log('Error encoding eat. Error: ', err);
            return callback(err, null);
          }
          console.log("ABOUT TO URI_ENCODE THIS TOKEN: ", eatToken);
          var encodedToken = encodeURIComponent(eatToken);
          console.log("NEWLY URI_ENCODED TOKEN IS: ", encodedToken);
          callback(null, encodedToken);
        });
      })
      // .catch(err => {
      //   console.log('Error saving EAT on user. Error: ', err);
      //   return callback(err, null);
      // });
  };

  User.prototype.invalidateToken = function invalidateToken(user, callback) {
    user.setDataValue('eat', null);
    user
      .save()
      .then(savedUser => {
        callback(null, savedUser );
      })
      .catch(err => {
        console.log('Could not save invalidated token. Error: ', err);
        return callback(err, null);
      });
  };

  User.prototype.isResetTokenStillValid = function isResetTokenStillValid() {
    // TODO: FIX THIS TO PASS IN THE USER OBJECT
    var timestamp = this.prtexpiration;
    return !Utils.isTimestampStillValid(timestamp);
  };

  User.prototype.checkPasswordResetToken = function checkPasswordResetToken(user, tokenToCheck, callback) {
    var hash = user.prt;
    Utils.checkUrlSafeTokenAgainstHash(tokenToCheck, hash, callback);
  };

  // Create any relational DB associations
  // Other association options here: http://sequelize.readthedocs.io/en/1.7.0/docs/associations/
  User.associate = function(models) {
    // Of all models, User model has many of SomeModel (which must also be in /models)
    // There are other methods like "belongsTo" if User belonged to another mddel instead
    // Using the hasMany/belongsTo between two models, you can create a 1:many relationship

    // models.User.hasMany(models.SomeModel);
  };

  return User;
};


