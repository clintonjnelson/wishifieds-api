'use strict';

var Eat  = require('eat');
var User = require('../../db/models/index.js').User;
// var User = require('../../models/User.js');
/*
  This middleware checks for a cookie named 'eat' sent in response from OAUTH
  This is because cookies are "passed through" the request to the oauth provider who also sends it back
  This is sometimes the only way to get internal auth/session information for ensuring auth on the response
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

      Eat.decode(decodedEatToken, secret, function(err, decoded) {
        if (err) {
          console.log('Eat was not valid format. Error: ', err);
          return next();
        }

        // Decodes => find user?
        User.findOne({ where: decoded })
          .then(function(user) {
            if (!user || (Object.keys(user).length === 0) ) {  // error or no user obj
              console.log('No user matches eat. User: ', user);
              return next(); // Do NOT fail; this is a pass-thru
            }
            console.log("AFTER FINDING USER FROM DECODED TOKEN, USER IS: ", user);

            req.user = user;  // user exists - attach for use
            // req.user.skipGen = true;  // skip re-gen of Eat in loadSendEat script
            next();           // next middleware
          })
          .catch(function(err) {
            console.log('Error finding eat. Error: ', err);
            return next(); // Do NOT fail; this is a pass-thru
          });
      });
    }

    else { return next(); }   // No token. Done.
  };
};
