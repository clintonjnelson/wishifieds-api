'use strict';

var Eat  = require('eat'                 );
var User = require('../../models/User.js');
/*
  This middleware checks for a cookie named 'eat' sent in response from OAUTH
  This occurs in the response from Oauth Provider's API.
  If found, it loads the corresponding user into the request at req.user
  Whether found or not, this middleware lets all requests pass through.
  THIS PREVENTS EAT TOKENS FROM BEING RE-ISSUED.
*/



module.exports = function(secret) {

  // Middleware-format; Insert secret.
  return function loadEatUser(req, res, next) {
    var eatToken = req.eat;  // loaded from prior middleware
    console.log("LOAD_EAT_USER EAT TOKEN ON REQ IS: ", eatToken);
    console.log("LOAD_EAT_USER EAT TOKEN FOUND IN FROM OAUTH PROVIDER API AS: ", eatToken);

    if(eatToken) {
      var decodedEatToken = decodeURIComponent(eatToken);
      console.log("DECODED EATOKEN IN LOAD_EAT_USER IS: ", decodedEatToken);

      // Token exists => try decoding
      Eat.decode(decodedEatToken, secret, function(err, decoded) {
        if (err) {
          console.log('Eat was not valid format. Error: ', err);
          return next();
        }

        // Decodes => find user?
        User.findOne(decoded, function(err, user) {
          if (err || !user || (Object.keys(user).length === 0) ) {  // error or no user obj
            console.log('No user matches eat. If Error: ', err, ' If user: ', user);
            return next();
          }

          // User found => attach for use with AUTOSIGN
          console.log("LOAD_EAT_USER GETS HERE WHEN FINDS USER: ", user);
          req.user         = user;
          req.user.skipGen = true;  // skip re-gen of Eat in loadSendEat script
          next();                   // next middleware
        });
      });
    }

    else { return next(); }   // No token. Done.
  };
};
