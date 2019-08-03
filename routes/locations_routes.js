'use strict';

var bodyparser = require('body-parser'      );
var db         = require('../db/models/index.js');
var sequelize  = db.sequelize;


module.exports = function(router) {
  router.use(bodyparser.json());

  router.get('/locations', function(req, res) {
    // Query the conditions
    // Initially we can hard-code these, but eventually they should be on the DB
    // Once on the DB, there should be a cacheing mechanism to avoid unnecessary hits on the DB.
    // Here's one approach: https://medium.com/the-node-js-collection/simple-server-side-cache-for-express-js-with-node-js-45ff296ca0f0
    res.json({msg: "Hit the base locations endpoint that has no code."});
  });

  // Used to search for a location (typeahead or otherwise)
  // This needs to also handle postal code
  router.get('/locations/typeahead', function(req, res) {
    var maybeCity = req.query['city'] || '';
    var maybeStateCode = req.query['statecode'] || '';
    var maybePostal = req.query['postal'] || '';
    var limit = req.query['limit'] || 10;

    var typeaheadQuery = getQuery(maybePostal, maybeCity, maybeStateCode);
    var params = {
      city: maybeCity,
      stateCode: maybeStateCode,
      postal: maybePostal,
      limit: limit,
    };

    // CUSTOM QUERY BECAUSE NEED PARTIAL ON UP-TO-TWO THINGS... and maybe not both.
    console.log("ABOUT TO QUERY FOR LOCATIONS...");
    if(typeaheadQuery && typeaheadQuery.length == 0) {
      res.status(400).json({msg: 'inadequate query or fields'});
    }

    sequelize
      .query(
        typeaheadQuery,
        { replacements: params, type: sequelize.QueryTypes.SELECT }
      )
      .then(function(foundLocations) {
        const results = foundLocations.map(function(loc) {
          return {
            id: loc.id,
            city: loc.city,
            stateCode: loc.stateCode,
            postal: loc.postal,
            typeaheadText: loc.typeahead,  // eg: 'Seattle, WA' OR '98101'
            geoInfo: loc.geoinfo,
          };
        });
        console.log("LOCATIONS SEARCH RESULTS:", results);
        res.json({locations: results});
      })
      .catch(function(err) {
        console.log("Error searching for locations by city, state, limit. Error: ", err);
      });
  });

  function getQuery(postal, city, stateCode) {
    console.log("Postal is: ", postal, " and city state is: ", city, stateCode);
    if(postal && postal.length > 1) {
      return 'SELECT * FROM location_typeahead_postal_v1(:postal::VARCHAR, :limit::INTEGER)';
    }
    else if(city && city.length && stateCode.length <= 2) {
      return 'SELECT * FROM location_typeahead_citystate_v1(:city::VARCHAR, :stateCode::VARCHAR, :limit::INTEGER)';
    }
    else {
      return;
    }
  }
}
