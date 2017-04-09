'use strict';

var BasicStrategy = require('passport-http'       ).BasicStrategy;
var User          = require('../../models/User.js');

module.exports = function(passport) {
  passport.use('basic', new BasicStrategy({}, function(email, password, next) {
    console.log("IN BASIC STRATEGY...");
    User.findOne({'email': email}, function(err, user) {
      if (err     ) { return next('database error'); }
      if (!user   ) { return next('user not found'); }

      user.checkPassword(password, function(err, result) {
        if(!result) { return next('wrong password'); }

        return next(null, user);  // return user if no auth errors
      });
    });
  }));
};
