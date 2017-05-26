'use strict';

var bodyparser  = require('body-parser');
var Interaction = require('../models/Interaction.js');
var eatAuth     = require('../lib/routes_middleware/eat_auth.js')(process.env.AUTH_SECRET);
var eatOnReq    = require('../lib/routes_middleware/eat_on_req.js');

module.exports = function(router) {
  router.use(bodyparser.json());

  router.get('/interactions/dashboards/userpagevisit', eatOnReq, eatAuth, function(req, res) {
    console.log("MADE IT TO INTERACTIONS GET DATA...");
    var userId = req.user._id;
    console.log("USERID IN INTERACTION REQUEST IS: ", userId);

    Interaction.find({targetType: 'userpageview', targetIdentifier: userId}, function(err, interactions) {
      if(err) {
        console.log('Error getting interactions: ', err);
        res.json(500, {error: true, msg: 'server error finding interactions'});
      }

      res.json(200, interactions);
    });
  });
}
