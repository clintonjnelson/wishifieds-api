'use strict';

// This is a middleware to load the user we captured in the request
// Having the EAT_AUTH middleware prior to this is critical to ensure user is avail on req
// OAuth has a "state" query param that gets passed through with the request
// The user should be loaded on there prior to sending the oauth request,
// so that when it comes back the user can be verified.

module.exports = function(router, passport, apiData) {

  return function oauthLoadEatState(req, res, next) {
    console.log("REQ EAT IN OAUTH IS: ", req.eat);
    // console.log("ROUTER IS: ", router);
    // console.log("PASSPORT IS: ", passport);
    console.log("APIDATA IS: ", apiData);
    console.log("ABOUT TO CALL OAUTH...");
    // console.log("COOKIES BEFORE IS: ", req.headers.cookie);
    // req.headers.cookie += (';oauth1eat=' + req.eat);
    // console.log("UPDATED COOKIES WITH OAUTH1 IS: ", req.headers.cookie);
    passport.authenticate(apiData.passportType,  // Specifies strategy, which is where Facebook info is validated
      { session: false,
        scope:   apiData.scope,
        state:   req.eat,
        failureRedirect: '/oauth/errors/validate_credibility'
      }
    )(req, res, next);
  }
}
