'use strict';
// Sending token with Login response, so that UI can save
// Eat token is used to authenticate the user on future UI requests
// This request


// module.exports = function loginSuccess(req, res, next) {
//   console.log("LOADSENDCOOKIE:  GENERATING TOKEN for user:", req.user);

//   // Skip if skipGen exists (Auto-Sign)
//   if( req.user.skipGen === true ) {
//     console.log("LOADSENDCOOKIE: SKIPGEN FOUND. AUTO-SIGN CREATION INDICATED.");
//     console.log("LOADSENDCOOKIE: USER THAT WE SHOULD REDIRECT TO IS: ", req.user);

//     var redirectUrl = '/' + req.user.username;
//     return res.redirect(redirectUrl);  // Redirect to homepage
//   }

//   // Else /login
//   console.log("LOADSENDCOOKIE: SKIPGEN NOT FOUND OR NOT RIGHT FORMAT. NOT SKIPPING TOKEN GEN.");
//   req.user.generateToken(process.env.AUTH_SECRET, function(err, encodedToken) {
//     if (err) {
//       console.log('Error generating token. Error: ', err);
//       return res.status(500).json({error: true, msg: 'internal server error'});
//     }

//     var redirectUrl = '/oauth/success/oauthsuccess?' +
//       'token='     + encodedToken +
//       '&username=' + req.user.username +
//       '&userId='   + req.user._id +
//       '&email='    + req.user.email +
//       '&role='     + req.user.role;
//     console.log("LOADSENDCOOKIE: SUCCESSFUL TOKEN GENERATION. REDIRECTING With Token TO ", redirectUrl);
//     return res.redirect(redirectUrl); // rediret & pass token as param
//   });

// };
