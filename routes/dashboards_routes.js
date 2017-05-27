'use strict';

var bodyparser  = require('body-parser');
var Interaction = require('../models/Interaction.js');
var Sign        = require('../models/Sign.js');
var eatAuth     = require('../lib/routes_middleware/eat_auth.js')(process.env.AUTH_SECRET);
var eatOnReq    = require('../lib/routes_middleware/eat_on_req.js');

module.exports = function(router) {
  router.use(bodyparser.json());

  router.get('/interactions/dashboards/userpagevisit', eatOnReq, eatAuth, function(req, res) {
    console.log("MADE IT TO INTERACTIONS GET USER PAGE VIEWS DATA...");
    var userId = req.user._id;
    console.log("USERID IN INTERACTION REQUEST IS: ", userId);
    var searchQuery = ( req.user.role === 'admin' ?
                      { targetCategory: 'userpageview' } :
                      { targetCategory: 'userpageview', targetIdentifier: userId } );

    Interaction.find(searchQuery, function(err, interactions) {
      if(err) {
        console.log('Error getting user page interactions: ', err);
        res.status(500).json({error: true, msg: 'server error finding interactions'});
      }

      res.json(interactions);
    });
  });

  router.get('/interactions/dashboards/signlinkoff', eatOnReq, eatAuth, function(req, res) {
    console.log("MADE IT TO INTERACTIONS GET SIGN DATA");
    var userId = req.user._id;
    console.log("USERID IN INTERACTION REQUEST IS: ", userId);

    // Admin => get ALL signs
    if(req.user.role === 'admin') {
      var searchQuery = { targetCategory: 'signlinkoff' };
      findSignInteractionsFromQuery(searchQuery);
    }
    else {
      // Non-Admin => get signs by user's ID
      Sign.find({userId: userId, status: 'A'}, function(err, signs) {
        if(err) {
          console.log("Error getting signs: ", err);
          return res.status(500).json({error: true, msg: 'Database error.'});
        }
        console.log("SIGNS FOUND: ", signs);

        // Get the sign IDs
        var signIds = signs.map(function(sign) {
          return sign._id;
        });

        var searchQuery = {targetCategory: 'signlinkoff', targetIdentifier: { $in: [signIds] } }
        findSignInteractionsFromQuery(searchQuery);
      });
    }

    function findSignInteractionsFromQuery(query) {
      // query interactions by sign ids
      Interaction.find(query, function(err, interactions) {
        if(err) {
          console.log('Error getting sign linkoff interactions: ', err);
          res.status(500).json({error: true, msg: 'server error finding interactions'});
        }
        console.log("SIGN INTERACTIONS FOUND ARE: ", interactions);
        res.json(interactions);  // note: res is still in scope
      });
    }
  });
}
