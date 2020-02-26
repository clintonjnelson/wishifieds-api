'use strict';

var bodyparser           = require('body-parser');
var setCors              = require('../lib/routes_middleware/set_cors_permissions.js');
// var removePassptSessions = require('../lib/routes_middleware/remove_passport_sessions.js');
var loadOauthRoutes      = require('./oauth/oauth_template.js'); // raw function
var crypto = require('crypto');
var db           = require('../db/models/index.js');
var Badge        = db.Badge;
var Confirmation = db.Confirmation;


module.exports = function(router, passport) {
  var OAUTH_CONFIG = getOauthConfigsLibrary();

  router.use(bodyparser.json());
  // router.use(removePassptSessions);  // bypass oauth1 sessions if needed (bring in "remove_passport_sessions.js" from syynpost project)

  // Require routes by provider
  loadOauthRoutes(router, passport, OAUTH_CONFIG['facebook']);

  // Deactivation endpoint for Facebook API to hit when user requests deactivation of Wishifieds
  router.post('/deactivation/facebook', function(req, res) {
    // Post contains Body with "signed_request"
    // Split this string on the "."
    // decode the first part using base64
    // decode the 2nd part using base64, then parse as json
    //

    console.log("Facebook deactivation request body: ", req.body);
    return res.status(200);
  })

  // Facebook data deletion endpoint. Passes FB UserID
    // Find (need reference), then destroy
    // Then create a confirmation
    // Then return the confirmation info to Facebook
  router.post('/delete_user_data/facebook/:user_id', function(req, res) {
    const fbUserId = req.params['user_id'];
    console.log("Facebook User ID IS: ", fbUserId);
    Badge
      .findOne({ where: {refId: fbUserId, badgeType: 'FACEBOOK'} })
      .then(function(fbBadge) {
        if(fbBadge) {
          fbBadge
            .destroy()
            .then(function(nodata) {
              console.log("Deleted badge for Facebook refUser: ", fbUserId);
              return createConfirmation(res, fbBadge, "SUCCESS");
            })
            .catch(function(delError) {
              console.log('Error deleting facebook badge during delete_user_data. Error: ', delError);
              return createConfirmation(res, fbBadge, 'FAILED');
            });
        }
        else {
          console.log('Failed to find FB badge. Result of find: ', fbBadge);
          return createConfirmation(res, fbBadge, "UNKNOWN");
        }
      })
      .catch(function(findError) {
        console.log("Error finding Facebook badge by reference ID: ", fbUserId);
        return createConfirmation(res, {userId: 'unknown'}, "UNKNOWN");
      });
  });

  // For serving status data for the confirmation page
  router.get('/data_deletion/:confirmationCode', function(req, res) {
    const code = req.params.confirmationCode;
    console.log("confirmation code is: ", code);
    Confirmation
      .findOne({where: {confirmationCode: code}, raw: true})
      .then(function(result) {
        return res.json({
          deletionType: 'Facebook',
          userId: result.userId,
          status: result.status,
          updatedAt: result.updatedAt,
          code: result.confirmationCode,
          url: result.url
        });
      })
  });
};



function getOauthConfigsLibrary() {
  return {
    facebook: {
      oauthVersion: '2',
      passportType: 'facebook',
      scope: ['user_link'],  // 'public_profile', 'email'
      session: false,
    }
  };
}

function createConfirmation(res, fbBadge, status) {
  const random = new Uint32Array(3);
  const code = 'fb-' + (fbBadge && fbBadge.userId) + '-' + crypto.randomFillSync(random).toString().replace(/,/g, '-');
  const preConfCode = {
    userId: ((fbBadge && fbBadge.userId) || null),
    confirmationCode: code,
    url: 'https://www.wishifieds.com/data_deletion/' + code,
    status: status
  };

  Confirmation
    .create(preConfCode)
    .then(function(confirmation) {
      return res.status(200).json({
        url: confirmation.url,
        confirmation_code: confirmation.confirmationCode
      });
    });
}




