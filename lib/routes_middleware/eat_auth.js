'use strict';
// This is the "eat" cookie middleware used to authenticate a user

var Eat  = require('eat');
// TODO: FIX THIS TO USE SEQUELIZE
var User = require('../../db/models/index.js').User;

module.exports = function(secret) {
  // Middleware-format; Insert secret.
  return function eatAuth(req, res, next) {
    var eatToken = req.eat;  // loaded from prior middleware
    console.log("EAT_AUTH EAT TOKEN ON REQ IS: ", eatToken);

    if (!eatToken) {  // token provided?
      console.log('No eat provided.');
      return res.status(401).json({ reset: true, error: 'please sign in to do that' });
    }

    console.log("EATOKEN PRIOR TO DECODING IS: ", eatToken);
    var uriDecodedEatToken = decodeURIComponent(eatToken);
    console.log("EATOKEN AFTER DECODING IS: ", uriDecodedEatToken);

    Eat.decode(uriDecodedEatToken, secret, function(err, decoded) {  // token exists, try decoding
      if (err) {
        console.log('Eat was not valid format. Error: ', err);
        return res.status(401).sendFile('/index.html', {root: __dirname + '/../../client/dist' });
      }
      console.log("AFTER DECODING, DECODED VALUE IS: ", decoded);

      const query = { where: decoded }  // decoded is object:: {eat: "somestring"}
      // TODO - FIX THIS
      User.findOne(query)
        .then(function(user) {
          if (!user || (Object.keys(user).length === 0) ) {  // error or no user obj
            console.log('No user matches eat. User: ', user);
            return res.status(401).json({ reset: true, error: 'please sign in to do that' });
          }
          console.log("AFTER FINDING USER FROM DECODED TOKEN, USER IS: ", user);

          req.user = user;  // user exists - attach for use
          next();           // next middleware
        })
        .catch(function(err) {
          console.log('Error finding eat. Error: ', err);
          return res.status(401).json({ reset: true, error: 'please sign in to do that' });
        });
    });
  };
};
