'use strict';

var adminAuth  = require('../lib/routes_middleware/admin_auth.js');
var bodyparser = require('body-parser');
var eatAuth    = require('../lib/routes_middleware/eat_auth.js'  )(process.env.AUTH_SECRET);
var eatOnReq   = require('../lib/routes_middleware/eat_on_req.js');
var updateSitemap = require('../lib/tasks/updateSitemap.js');
var userCleanup   = require('../lib/tasks/userCleanup.js');

module.exports = function(router) {
  router.use(bodyparser.json());

  router.put('/tasks/sitemap', eatOnReq, eatAuth, adminAuth, function(req, res) {

    if(req.body.trigger === true) {

      // Update Sitemap
      updateSitemap(req, function(error) {
        if(error) { return res.status(500).json({success: false, error: true}); }

        return res.status(200).json({success: true, error: false});
      });
    } else {
      return res.status(500).json({success: false, error: true});
    }
  });

  router.get('/tasks/cleanupusers', function(req, res) {
    console.log("MADE IT TO THE ROUTE...");

    userCleanup(function(err) {
      if(err) {
        console.log("Error cleaning up users.");
        return res.status(500).json({success: false, error: true});
      }

      return res.status(200).json({success: true, error: false});
    });
  });
}

