'use strict';

// This middleware OPTIONALLY sets the user on the req when available
// This middleware will NOT fail the request if user is not found

var Eat  = require('eat');
var User = require('../../db/models/index.js').User;

module.exports = function(secret) {
  // Middleware-format; Insert secret.
  return function eatAuth(req, res, next) {
    var eatToken = req.eat;  // loaded from prior middleware
    console.log("Eat token in req_on_user: ", eatToken);

    if (!eatToken) {  // token provided?
      console.log('No eat provided.');
      return next();  // Done & continue
    }

    var uriDecodedEatToken = decodeURIComponent(eatToken);
    Eat.decode(uriDecodedEatToken, secret, function(err, decoded) {  // token exists, try decoding
      if (err) {
        console.log('Eat was not valid format. Done: ', err);
        return next();  // Continue on
      }
      console.log("DECODED EAT IS: ", decoded);

      User.findOne({ where: decoded })  // decoded is object:: {eat: "somestring"}
        .then(function(user) {
          if (!user || (Object.keys(user).length === 0) ) {  // error or no user obj
            console.log('No user matches eat. User: ', user);
            return next();
          }
          console.log("User found in user_on_req: ", user);

          req.user = user;  // user exists - attach to req!
          return next();           // next middleware
        })
        .catch(function(err) {
          console.log('Error finding user by eat. Error: ', err);
          return next();  // continue on
        });
    });
  };
};
