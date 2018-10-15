'use strict';

const BasicStrategy = require('passport-http').BasicStrategy;
const User          = require('../../db/models/index.js').User;

module.exports = function(passport) {
  passport.use('basic', new BasicStrategy({}, function(email, password, next) {
    console.log("IN BASIC STRATEGY...");
    console.log("User is: ", User);
    User
      .findOne({where: {email: email}})
      .then(function(user) {
        if (!user   ) { return next('user not found'); }
        console.log("user found from login email, checking password...");

        User.prototype.checkPassword(password, user, function(err, result) {
          if(err)     { return next('error when checking password'); }
          if(!result) { return next('wrong password'); }

          console.log("password checks out, passing user:", user);
          return next(null, user);  // return user if no auth errors
        });
      });
      // .catch(function(err){
      //   console.log('Caught error in basic auth!');
      //   return next('database error');
      // });
  }));
};
