'use strict';

var bodyparser = require('body-parser'      );
var eatOnReq   = require('../lib/routes_middleware/eat_on_req.js');
var eatAuth    = require('../lib/routes_middleware/eat_auth.js'  )(process.env.AUTH_SECRET);
var db         = require('../db/models/index.js');
var Listings   = db.Listing;
var Favorites  = db.Favorite;
var Images     = db.Image;
var User       = db.User;
var Sequelize  = require('sequelize');


// Favorites are just associations between a non-owner user and a listing

// TODO: Modify save query so owner can't favorite their own listing
module.exports = function(router) {
  router.use(bodyparser.json());

  // Get the favorites for the requesting user
  router.get('/favorites', eatOnReq, eatAuth, function(req, res) {
    const userId = req.user.id;
    const listingIds = req.query['listingIds'] && req.query['listingIds'].split(',');

    if(!listingIds || !listingIds.length) { return respond400ErrorMsg(res, 'Listing id is required.'); }

    console.log("IN FAVORITES ROUTE. USER ID IS: ", userId);
    Favorites
      .findAll({
        where: {
          userId: userId,
          status: 'ACTIVE',
          listingId: {
            [Sequelize.Op.or]: listingIds,
          },
        }
      })
      .then(function(favs) {
        console.log("FAVS ARE: ", favs);

        const favStatuses = favs.reduce(function(total, fav) {
          console.log("THIS FAV IS: ", fav);
          console.log("TOTAL IS: ", total);
          console.log("FAV IN TOTAL IS: ", total[fav.listingId]);
          const status = fav.status;
          if(status) {
            if(status == 'ACTIVE') {
              total[fav.listingId] = true
            }
            else {
              total[fav.listingId] = false;
            }
          }

          return total; // always return object
        },{}); // accumulates into a single object

        return res.json({error: false, success: true, favStatuses: favStatuses });
      })
      .catch(function(err) {
        console.log("Caught error querying favorites for listing Ids: ", err);
        return res.status(500).json({error: true, success: false});
      });
  });

  // Add Favorite
  router.post('/favorites/:listingId', eatOnReq, eatAuth, function(req, res) {
    const userId = req.user.id;
    const listingId = req.params.listingId;
    console.log("IN ADD FAVORITES ROUTE. USER ID IS: ", userId);

    if(!listingId) { return respond400ErrorMsg(res, 'Listing id is required.'); }
    console.log("ABOUT TO ADD FAVOROITE FOR listingId: ", listingId, "and user: ", userId);
    Favorites
      .findOrCreate({where: { userId: userId, listingId: listingId, status: 'ACTIVE' }})  // If exists, set ACTIVE
      .then(function(newFav) {
        console.log("SUCCESSFULLY ADDED. newFav is: ", newFav);
        return res.json({error: false, success: true}); // UI doesn't need listing back yet (just toggles heart)
      })
      .catch(function(err) {
        console.log("Error creating favorite: ", err);
        return res.status(500).json({error: true, success: false, msg: 'Error creating favorite.'});
      });
  });

  router.delete('/favorites/:listingId', eatOnReq, eatAuth, function(req, res) {
    const userId = req.user.id;
    const listingId = req.params.listingId;
    console.log("IN ADD FAVORITES ROUTE. USER ID IS: ", userId);

    if(!listingId) { return respond400ErrorMsg(res, 'Listing id is required.'); }

    console.log("ABOUT TO REMOVE FAVOROITE FOR listingId: ", listingId, "and user: ", userId);
    Favorites
      .update({ status: 'DELETED'}, {where: { userId: userId, listingId: listingId }})
      .then(function(newFav) {
        console.log("SUCCESSFULLY REMOVED. newFav is: ", newFav);
        return res.json({error: false, success: true}); // UI doesn't need listing back yet (just toggles heart)
      })
      .catch(function(err) {
        console.log("Error creating favorite: ", err);
        return res.status(500).json({error: true, success: false, msg: 'Error creating favorite.'});
      });
  });



  // --------------------------------- HELPERS ---------------------------------
  // TODO: MOVE TO response.js in lib
  function respond400ErrorMsg(res, errorMsg) {
    console.log('Error in data. Sending 400 msg: ', errorMsg);
    return res.status(400).json({error: true, msg: errorMsg});
  }

  function parseOrGetUserId(usernameOrId, callback) {
    if( isNaN(parseInt(usernameOrId, 10)) ) {
      User
        .findOne({where: {username: usernameOrId}})
        .then(function(user) {
          callback(user.id, null);
        })
        .catch(function(error) {
          callback(null, error);
        });
    }
    else {
      callback(parseInt(usernameOrId, 10), null);
    }
  }
}

