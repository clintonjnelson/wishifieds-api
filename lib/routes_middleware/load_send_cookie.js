'use strict';
// Sending token with Login

module.exports = function loginSuccess(req, res, next) {
  console.log("LOADSENDCOOKIE:  GENERATING TOKEN for user:", req.user);

  // Skip if skipGen exists (Auto-Sign)
  if( req.user.skipGen === true ) {
    console.log("LOADSENDCOOKIE: SKIPGEN FOUND. AUTO-SIGN CREATION INDICATED.");
    console.log("LOADSENDCOOKIE: USER THAT WE SHOULD REDIRECT TO IS: ", req.user);

    var redirectUrl = '/' + req.user.username;
    return res.redirect(redirectUrl);  // Redirect to homepage
  }

  // Else /login
  console.log("LOADSENDCOOKIE: SKIPGEN NOT FOUND OR NOT RIGHT FORMAT. NOT SKIPPING TOKEN GEN.");
  req.user.generateToken(process.env.AUTH_SECRET, function(err, token) {
    if (err) {
      console.log('Error generating token. Error: ', err);
      return res.status(500).json({error: true, msg: 'internal server error'});
    }

    var encodedToken = encodeURIComponent(token);      // encode to HTML-safe for parsing
    console.log("LOADSENDCOOKIE: SUCCESSFUL TOKEN GENERATION. REDIRECTING With Token TO OAUTH /auth?token=" + token);
    return res.redirect('/#/oauth?token=' + encodedToken); // rediret & pass token as param
  });

};
