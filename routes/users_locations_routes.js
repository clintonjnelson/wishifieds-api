'use strict';

var bodyparser   = require('body-parser'      );
var eatOnReq     = require('../lib/routes_middleware/eat_on_req.js');
var eatAuth      = require('../lib/routes_middleware/eat_auth.js'  )(process.env.AUTH_SECRET);
var ownerAuth    = require('../lib/routes_middleware/owner_auth.js');
var db           = require('../db/models/index.js');
var Locations    = db.Location;
var UserLocation = db.UserLocation;
var sequelize    = db.sequelize;

const DEFAULT_ZIPCODE = '98101';

module.exports = function(router) {

  // Get user's locations
  router.get('/users/:id/locations', function(req, res) {
    var userId = req.params.id;
    UserLocation
      .findAll({
        where: { userId: userId, status: 'ACTIVE' },
        include: [ Locations ]
      })
      .then(function(foundLocations) {
        console.log("Found user's locations! Locations: ", foundLocations);

        const locations = foundLocations.map(mapLocations)
        res.json({locations: locations});
      })
      .catch(function(err) {
        console.log("Error getting user's locations: ", err);
        return res.status(500).json({error: true, msg: 'Error getting user\'s locations'});
      });

    function mapLocations(dbUserLoc) {  // This is the UserLocation object; Location object is joined inside
      console.log("One user location to map is: ", dbUserLoc);
      const loc = dbUserLoc.Location.get();
      console.log("Location found is: ", loc);
      return {
        userLocationId: dbUserLoc.id,  // the user's location, not the UL join table
        description:    (dbUserLoc.description || loc.description),  // try both
        status:         dbUserLoc.status,
        isDefault:      dbUserLoc.isDefault,
        locationId:     loc.id,
        geoInfo:        { latitude: loc.geography.coordinates[1], longitude: loc.geography.coordinates[0] },
        city:           loc['city'],
        stateCode:      loc['stateCode'],
        postal:         loc['postal'],
        locationType:   loc['locationType'],
      };
    }
  });

  // Set the default user location
  router.patch('/users/:id/locations', eatOnReq, eatAuth, ownerAuth('id'), function(req, res) {
    console.log("Made it to the set default user location endpoint.");

    // TODO: Better validations here
    var userId = req.params.id;
    var userLocationId = req.body.userLocationId;

    // MUST be a transaction, because sets all user's defaults false before setting new one true
    return sequelize.transaction(t => {
      return UserLocation
        .update(
          {isDefault: false},
          {where: {userId: userId, isDefault: true}},
          {transaction: t}
        )
        .then(function(numberUpdated) {
          console.log("All of the user's locations are updated to remove default.");
          return UserLocation
            .findById(userLocationId, {transaction: t})
            //.findByPk(userLocationId, {transaction: t})  // Use for Sequelize v5+
            .then(function(foundUserLocation) {
              console.log("Found the user location to set to default: ", foundUserLocation);
              foundUserLocation.setDataValue('isDefault', true);
              return foundUserLocation
                .save({transaction: t})
                .then(function(savedUserLocation) {
                  console.log("Default location Saved!!! :-D");
                  return res.json({error: false, msg: ''});
                })
            });
        });
    });
  });

  // Get user's locations
  // TODO: Verify that can ONLY update own Locations. May have to add OwnerAuth?????
  router.post('/users/:id/locations', eatOnReq, eatAuth, ownerAuth('id'), function(req, res) {
    console.log("MADE IT TO POSTULOC. Body is: ", req.body);
    var userId = req.params.id;

    // Two queries, because it's a create (low tps), better error feedback, sequelize
    Locations
      .find({ where: { postal: req.body.postal }})
      .then(function(foundLocation) {
        if(!foundLocation) {
          return res.status(404).json({error: true, msg: 'not-found'});
        }
        else {
          console.log("Found this location from postal to use for saving: ", foundLocation);
        UserLocation
          .create({
            userId: userId,
            locationId: foundLocation.id,
            description: req.body['description']
          })
          .then(function(newUserLocation) {
            console.log("UserLocation created: ", newUserLocation);

            res.json({locations: mapLocations(newUserLocation, foundLocation)});
          })
          .catch(function(err) {
            console.log("Error creating user location: ", err);
            return res.status(500).json({error: true, msg: 'Error creating user location'});
          });
        }
      })
      .catch(function(error) {
        console.log("Error attempting to find a location from zipcode for a new user location.");
        res.status(500).json({error: true, msg: 'Error finding zip for creating user location'});
      });

    function mapLocations(userLoc, loc) {
      console.log("One location to map is: ", userLoc);
      console.log("Location found is: ", loc);
      return {
        userLocationId: userLoc.id,  // the user's location, not the UL join table
        description:    (userLoc.description || loc.description),  // try both
        status:         userLoc.status,
        isDefault:      userLoc.isDefault,
        postal:         loc.postal,
        geoInfo:        {latitude: loc.geography.coordinates[0], longitude: loc.geography.coordinates[1]},
      };
    }
  });

  // TODO: MAKE SURE THAT THE DELETED USER LOCATION IS NOT THE DEFAULT!!
  router.delete('/users/:id/locations/:userLocationId', eatOnReq, eatAuth, ownerAuth('id'), function(req, res) {
    console.log("Made it to the DELETE user location endpoint.");

    // TODO: Better validations here
    var userId = req.params.id;
    var userLocationId = req.params.userLocationId;

    // Cannot delete the default location. User must change & then delete non-default.
    UserLocation
      .findById(userLocationId)
      .then(function(foundUserLocation) {
        console.log("Found user location to delete.");
        if(foundUserLocation.isDefault) {
          return res.status(409).json({error: true, msg: 'cannot-delete-default'});
        }
        else {
          foundUserLocation.setDataValue('status', 'DELETED');
          foundUserLocation
            .save()
            .then(function(savedUserLocation) {
              console.log("Deleted the user location!");
              return res.json({error: false, msg: 'successful delete'});
            });
        }
      });
  });
}
