'use strict';

// var bodyparser   = require('body-parser'      );
// var eatOnReq     = require('../lib/routes_middleware/eat_on_req.js');
// var eatAuth      = require('../lib/routes_middleware/eat_auth.js'  )(process.env.AUTH_SECRET);
// var ownerAuth    = require('../lib/routes_middleware/owner_auth.js');
// var adminAuth    = require('../lib/routes_middleware/admin_auth.js');
// var MailService  = require('../lib/mailing/mail_service.js');
// TODO: WILL NEED SERVICE FOR SMS CAPABILITIES HERE
// var EmailBuilder = require('../lib/mailing/email_content_builder.js');
// var Utils        = require('../lib/utils.js');
// var User         = require('../db/models/index.js').User;
// var Sequelize    = require('sequelize');


module.exports = function(router) {

  // Create Listing
  router.get('/conditions', function(req, res) {
    // Query the conditions
    // Initially we can hard-code these, but eventually they should be on the DB
    // Once on the DB, there should be a cacheing mechanism to avoid unnecessary hits on the DB.
    // Here's one approach: https://medium.com/the-node-js-collection/simple-server-side-cache-for-express-js-with-node-js-45ff296ca0f0
    const conditions = [
      { id: 1, icon: 'star', name: 'any' },
      { id: 2, icon: 'star', name: 'as-is' },
      { id: 3, icon: 'star', name: 'poor' },
      { id: 4, icon: 'star', name: 'fair' },
      { id: 5, icon: 'star', name: 'good' },
      { id: 6, icon: 'star', name: 'excellent' },
      { id: 7, icon: 'star', name: 'new' },
      { id: 8, icon: 'star', name: 'not applicable' }
    ];

    res.json({conditions: conditions});
  });
}
