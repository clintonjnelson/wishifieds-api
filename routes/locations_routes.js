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



////////////////////////
// NOT HOOKED UP YET! //
////////////////////////



module.exports = function(router) {

  // Create Listing
  router.get('/locations', function(req, res) {
    // Query the conditions
    // Initially we can hard-code these, but eventually they should be on the DB
    // Once on the DB, there should be a cacheing mechanism to avoid unnecessary hits on the DB.
    // Here's one approach: https://medium.com/the-node-js-collection/simple-server-side-cache-for-express-js-with-node-js-45ff296ca0f0


    res.json();
  });
}