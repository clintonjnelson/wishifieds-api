'use strict';
var bodyparser     = require('body-parser'         );
var eatOnReq       = require('../../lib/routes_middleware/eat_on_req.js');
var eatAuth        = require('../../lib/routes_middleware/eat_auth.js')(process.env.AUTH_SECRET);
var loadEatUser    = require('../../lib/routes_middleware/load_eat_user.js')(process.env.AUTH_SECRET);
var loadSendCookie = require('../../lib/routes_middleware/load_send_cookie.js');
var User           = require('../../models/User.js');


module.exports = function(router, passport) {
  router.use(bodyparser.json());

  passport.serializeUser(function(oauth1, done) {
    done(null, '1');
  });
  passport.deserializeUser(function(oauth1, done) {
    done(null, oauth1);
  });


  // Redirect to twitter for auth
  router.get('/login/twitter',
    // eatOnReq,
    passport.authenticate('twitter',
      {
      }
    )
  );

  // Twitter redirects to here after auth
  router.get('/auth/twitter/callback',
    eatOnReq,
    loadEatUser,
    passport.authenticate('twitter',  // try to: hit api, find/make user, find/make sign
      {
        failureRedirect: '/#/'   // only redirect for failure
      }
    ),
    loadSendCookie    // Middleware to load Eat cookie & send upon success
  );

  //-------------------------------- AUTO SIGN ---------------------------------
  router.get('/auto/twitter',
    eatOnReq,
    eatAuth,                                // verify & load user in req
    passport.authenticate('twitter',
      {
      }
    )
  );
};

