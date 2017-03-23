'use strict';
/*Template for Creating Oauth2 Api Routes

  Example of apiData object
    { passportType: 'facebook',
      scope: ['public_profile', 'email'],
    };
*/


var bodyparser     = require('body-parser'         );
var eatOnReq       = require('../../lib/routes_middleware/eat_on_req.js');
var loadEatUser    = require('../../lib/routes_middleware/load_eat_user.js')( process.env.AUTH_SECRET);
var loadSendCookie = require('../../lib/routes_middleware/load_send_cookie.js');
var User           = require('../../models/User.js');
var makeOauthReqWithEat = require('../../lib/routes_middleware/make_oauth_req_with_eat.js');

module.exports = function(router, passport, apiData) {
    router.use(bodyparser.json());


    //---------------------------------- LOGIN -----------------------------------
    // Redirect to API for auth
    router.get('/login/' + apiData.passportType,
      passport.authenticate(apiData.passportType,  // type of passport to use
        { session: false,
          scope:   apiData.scope,
        }
      )
    );

    // API redirects to here after auth
    router.get('/auth/' + apiData.passportType + '/callback',
      eatOnReq,
      loadEatUser,                                // check for eat token, load if valid. For: AUTO-SIGN
      passport.authenticate(apiData.passportType, // try to: hit api, find/make user, find/make sign
        { session:         false,
          failureRedirect: '/',                 // TODO: Error handle (client: guest(noEat), user(Eat))
        }
      ),
      loadSendCookie                              // Middleware to load eat cookie & send. For: SIGNUP/LOGIN
    );


    //-------------------------------- AUTO SIGN ---------------------------------
    router.get('/auto/' + apiData.passportType,
      eatOnReq,
      // eatAuth, // ADD THIS BACK IN
      makeOauthReqWithEat(router, passport, apiData)   // Load values into middleware
    );
};
