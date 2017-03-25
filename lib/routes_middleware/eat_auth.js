'use strict';
// This is the "eat" cookie middleware used to authenticate a user


// BREAK OUT COOKIE PARSING FUNCTION USED HERE, LOAD_EAT_USER, OAUTH EAT
var eat  = require('eat'                 );
var User = require('../../models/User.js');

module.exports = function(secret) {
  // Middleware-format; Insert secret.
  return function eatAuth(req, res, next) {
    var eatToken = req.eat;  // loaded from prior middleware
    console.log("EAT_AUTH EAT TOKEN ON REQ IS: ", eatToken);

    if (!eatToken) {  // token provided?
      console.log('No eat provided.');
      return res.redirect(401, '/').json({ reset: true, error: 'please sign in to do that' });
    }
    console.log("EATOKEN PRIOR TO DECODING IS: ", eatToken);
    var decodedEatToken = decodeURIComponent(eatToken);
    console.log("EATOKEN AFTER DECODING IS: ", decodedEatToken);

    eat.decode(decodedEatToken, secret, function(err, decoded) {  // token exists, try decoding
      if (err) {
        console.log('Eat was not valid format. Error: ', err);
        return res.status(401).json({ reset: true, error: 'please sign in to do that' });
      }
      console.log("AFTER DECODING, DECODED VALUE IS: ", decoded);

      User.findOne(decoded, function(err, user) {  // decodes, so find user
        if (err || !user || (Object.keys(user).length === 0) ) {  // error or no user obj
          console.log('No user matches eat. If Error: ', err, ' If user: ', user);
          return res.status(401).json({ reset: true, error: 'please sign in to do that' });
        }
        console.log("AFTER FINDING USER FROM DECODED TOKEN, USER IS: ", user);

        req.user = user;  // user exists - attach for use
        next();           // next middleware
      });
    });
  };
};
