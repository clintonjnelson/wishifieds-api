'use strict';

var bodyparser   = require('body-parser'      );
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
  // router.use(bodyparser.json());

  router.get('/categories', function(req, res) {
    // Query the conditions
    // Initially we can hard-code these, but eventually they should be on the DB
    // Once on the DB, there should be a cacheing mechanism to avoid unnecessary hits on the DB.
    // Here's one approach: https://medium.com/the-node-js-collection/simple-server-side-cache-for-express-js-with-node-js-45ff296ca0f0
    const categories = [
      { id: 1, icon: 'star', name: 'antiques' },
      { id: 2, icon: 'paintbrush', name: 'art' },
      { id: 3, icon: 'star', name: 'atv & off-road' },
      { id: 4, icon: 'star', name: 'autoparts' },
      { id: 5, icon: 'car', name: 'autos' },
      { id: 6, icon: 'star', name: 'baby & kids' },
      { id: 7, icon: 'star', name: 'bicycles & parts' },
      { id: 8, icon: 'star', name: 'boats & watercraft' },
      { id: 9, icon: 'star', name: 'books & magazines' },
      { id: 10, icon: 'star', name: 'camera & video' },
      { id: 11, icon: 'star', name: 'clothing & assessories' },
      { id: 12, icon: 'star', name: 'collectibles' },
      { id: 13, icon: 'star', name: 'computers' },
      { id: 14, icon: 'star', name: 'electronics' },
      { id: 15, icon: 'star', name: 'farm & agriculture' },
      { id: 16, icon: 'star', name: 'furniture' },
      { id: 17, icon: 'star', name: 'games & toys' },
      { id: 18, icon: 'star', name: 'gigs' },
      { id: 19, icon: 'star', name: 'health & beauty' },
      { id: 20, icon: 'star', name: 'housewares' },
      { id: 21, icon: 'star', name: 'housing & apartments' },
      { id: 22, icon: 'star', name: 'jewelery' },
      { id: 23, icon: 'star', name: 'lawn & garden' },
      { id: 24, icon: 'star', name: 'materials' },
      { id: 25, icon: 'star', name: 'motorcycles & scooters' },
      { id: 26, icon: 'star', name: 'musical goods' },
      { id: 27, icon: 'star', name: 'other' },
      { id: 28, icon: 'star', name: 'real estate' },
      { id: 29, icon: 'star', name: 'rentals' },
      { id: 30, icon: 'star', name: 'services & consulting' },
      { id: 31, icon: 'star', name: 'sporting goods' },
      { id: 32, icon: 'star', name: 'tickets & events' },
      { id: 33, icon: 'star', name: 'tools & equipment' },
      { id: 34, icon: 'star', name: 'travel & accommodations'  }
    ];

    res.json({categories: categories});
  });
}
