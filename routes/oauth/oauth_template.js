'use strict';
var bodyparser          = require('body-parser'         );
var eatOnReq            = require('../../lib/routes_middleware/eat_on_req.js');
var eatAuth             = require('../../lib/routes_middleware/eat_auth.js')(process.env.AUTH_SECRET);
var loadEatUser         = require('../../lib/routes_middleware/load_eat_user.js')(process.env.AUTH_SECRET);
// var loadSendCookie      = require('../../lib/routes_middleware/load_send_cookie.js');
var makeOauthReqWithEat = require('../../lib/routes_middleware/make_oauth_req_with_eat.js');


module.exports = function(router, passport, apiData) {
  router.use(bodyparser.json());

  // We use eat token on cookie, instead of oauth1 sessions
  // Must override with fake value or will get an error in oauth1
  // Oauth1 ONLY (skips if Oauth2+)...
  if(apiData.oauthVersion && apiData.oauthVersion === '1') {
    passport.serializeUser(function(oauth1, done) {
      done(null, '1');
    });
    passport.deserializeUser(function(oauth1, done) {
      done(null, oauth1);
    });
  }

  // 1) Request comes into here
  router.get('/validate_credibility/' + apiData.passportType,  // use to be /auto/
    eatOnReq,
    eatAuth,                                        // verify & load user in req
    makeOauthReqWithEat(router, passport, apiData)  // Build & send request to FB
  );

  // 2) Redirects to here after auth
  router.get('/validate_credibility/' + apiData.passportType + '/callback',
    eatOnReq,
    loadEatUser,
    passport.authenticate(apiData.passportType,  // Handles credibility validation as middleware in here!
      {
        session: apiData.session,
        failureRedirect: '/oauth/errors/oautherror'   // only redirect for failure
      }
    ),
    handleAndRespondBackValidCredibility
  );

  // Middleware to handle responding back to the user with success/failure of validate_credibility request
  function handleAndRespondBackValidCredibility(req, res, next) {
    // In here need to...
    // 1) Update the user external credibility validation facebook field to status: active (this will activate FB badge)
    // 2) Send the FB user's home page link to the UI for the FB badge link
    // 3) Update the response with the real stuff sent back from the facebook.js strategy authentication stuff
    //res.json({error: false, msg: 'success', badges: [{ badgeType: 'facebook', status: 'active', link: 'www.facebook.com' }] });
    var redirectUrl = '/' + req.user.username + '/settings';
    console.log("Successfully validated Credibility for Facebook for user: ", req.user.id, " Redirecting back to UI.");
    return res.redirect(redirectUrl);
  }
};
