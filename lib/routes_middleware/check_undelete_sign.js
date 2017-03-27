'use strict';
// Intercept oauth creation to see if the sign already exists in a deleted form
// If it exists, simply undelete it and redirect to the user's page for display
var Sign = require('../../models/Sign.js');


module.exports = function(req, res, next) {
  // console.log("REQUEST THAT HOPEFULLY HAS SOME HINT OF WHICH SIGN TO UNDELETE...", req);
  var signType = req.query.signType;
  console.log("MAYBE HERE????", signType);
  if(signType) {
    Sign.find({userId: req.user._id, signType: req.query.signType}, function(err, signs) {
      if(err) {
        console.log('Error un-deleting oauth sign: ', err);
        return next();
      }
      if(!signs || !signs.length) {
        console.log('No sign found to undelete. Continuing with creation...');
        return next();
      }
      console.log("FOUND SIGN FOR UNDELETE AS: ", signs);

      signs.forEach(function(sign) {
        console.log("SIGN TO UNDELETE: ", sign);
        if(sign.signType === signType && sign.status === 'D') {
          sign.status = 'A';
          sign.save();
        }
      })
      console.log("DELETED SIGNS HAVE BEEN UN-DELETED. RETURNING TO USER PAGE...");
      res.redirect('/' + req.user.username);
    });
  }
}

// FIND OUT IF THE USER HAS THE TYPE OF SIGN THAT IS REQUESTED
  // IF SO, CHANGE THE SIGN STATUS TO ACTIVE & RETURN OUT
