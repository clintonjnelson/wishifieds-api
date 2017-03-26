'use strict';
var bodyparser     = require('body-parser'         );
var eatOnReq       = require('../../lib/routes_middleware/eat_on_req.js');
var eatAuth        = require('../../lib/routes_middleware/eat_auth.js')(process.env.AUTH_SECRET);
var loadEatUser    = require('../../lib/routes_middleware/load_eat_user.js')(process.env.AUTH_SECRET);
var loadSendCookie = require('../../lib/routes_middleware/load_send_cookie.js');
var makeOauthReqWithEat = require('../../lib/routes_middleware/make_oauth_req_with_eat.js');
var User           = require('../../models/User.js');


module.exports = function(router, passport, apiData) {
  router.use(bodyparser.json());

  // We use eat token on cookie, instead of oauth1 sessions
  // Must override with fake value or will get an error in oauth1
  if(apiData.oauthVersion && apiData.oauthVersion === '1') {
    passport.serializeUser(function(oauth1, done) {
      done(null, '1');
    });
    passport.deserializeUser(function(oauth1, done) {
      done(null, oauth1);
    });
  }

  // TODO: Redirect to a route that triggers oauth failure error banner



  // Redirect to twitter for auth
  router.get('/login/' + apiData.passportType,
    // eatOnReq,
    passport.authenticate(apiData.passportType,
      {
        session: apiData.session,
        failureRedirect: '/errors/oauthloginerror'  // will this work in oauth1????
      }
    )
  );

  // Redirects to here after auth
  router.get('/auth/' + apiData.passportType + '/callback',
    eatOnReq,
    loadEatUser,
    passport.authenticate(apiData.passportType,  // try to: hit api, find/make user, find/make sign
      {
        session: apiData.session,
        failureRedirect: '/errors/oautherror'   // only redirect for failure
      }
    ),
    loadSendCookie    // Middleware to load Eat cookie & send upon success
  );

  //-------------------------------- AUTO SIGN ---------------------------------
  router.get('/auto/' + apiData.passportType,
    eatOnReq,
    eatAuth,                                // verify & load user in req
    makeOauthReqWithEat(router, passport, apiData)
  );
};
