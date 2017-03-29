'use strict';
// Intercept oauth creation to see if the sign already exists in a deleted form
// If it exists, simply undelete it and redirect to the user's page for display
// ONLY works for OAUTH signs
var Sign = require('../../models/Sign.js');


module.exports = function(req, res, next) {
  // console.log("REQUEST THAT HOPEFULLY HAS SOME HINT OF WHICH SIGN TO UNDELETE...", req);
  var signType = req.query.signType;
  console.log("MAYBE HERE????", signType);

  // Don't check because middleware is currently only for Oauth
  // If expand, will need to ensure signType !== 'custom'
  if(signType) {

    // ISSUE!!! THIS IS WHY IT WAS SHUT OFF. IF SOLVE THIS, COULD MAYBE BRING BACK:::::
      // WHAT ABOUT MULTI-SIGNS??? WHAT IF DELETE TWO WITH AUTH AND TWO WITHOUT?
      // THIS WILL BRING BACK THE ONES THAT STILL HAVE AUTH & LEAVE THE OTHERS.
      // HOW GET THOSE OTHERS BACK??
    Sign.find({userId: req.user._id, signType: req.query.signType}, function(err, signs) {
      if(err) {
        console.log('Error un-deleting oauth sign: ', err);
        return next();
      }
      if(!signs || !signs.length) {
        console.log('No sign found to undelete. Continuing with creation...');
        return next();
      }
      if(signs && signs.length > 0) {
        var undeleteSigns = signs.filter(function(sign) {
          return sign.profileId !== 'D';  // Keep if HAS profileID no deleted
        });
        console.log('UNDELETE - FILTERED SIGNS FOR UN-DELETION: ', undeleteSigns);

        if(undeleteSigns.length > 0) {
          undeleteSignsAndSendResponse(undeleteSigns);
        }
        else {
          console.log("NO SIGNS TO UNDELETE, CONTINUING TO API CONNECT...");
          return next();
        }
      }


      // Signs found to undelete
      function undeleteSignsAndSendResponse(signs) {
        // Undelete ALL signs
        signs.forEach(function(sign) {
          console.log("SIGN TO UNDELETE: ", sign);
          if(sign.signType === signType && sign.status === 'D') {
            sign.status = 'A';
            sign.save();
          }
        })
        console.log("DELETED SIGNS HAVE BEEN UN-DELETED. RETURNING TO USER PAGE...");
        res.redirect('/' + req.user.username);
      }
    });
  }
}

// FIND OUT IF THE USER HAS THE TYPE OF SIGN THAT IS REQUESTED
  // IF SO, CHANGE THE SIGN STATUS TO ACTIVE & RETURN OUT
