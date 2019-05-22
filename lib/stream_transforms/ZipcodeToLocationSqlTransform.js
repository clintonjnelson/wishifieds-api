'use strict';

var Transform  = require('stream').Transform;

// Transform Stream that pulls out geo data & builds Locations sql rows for insertion
// Export the Transform class to be used on each piece of data
module.exports = class ZipcodeToLocationSqlTransform extends Transform {
  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, next) {
    // Get data from each line & populate SQL script
    var pieces = chunk.trim().split('\t');
    // console.log('PIECES ARE: ', pieces);

    // Pull out data pieces for sql population
    if(pieces.length > 1) {
      var zip = pieces[1].trim();
      var lat = pieces[9].trim();
      var lon = pieces[10].trim();

      // Build the Point & Sql
      var geoPoint = "ST_SetSRID(ST_GeomFromGeoJSON('{ \"type\": \"Point\", \"coordinates\": [" + lon + "," + lat + "] }')::geography, 4326)";
      var fullSql = "('', " + geoPoint + ", 'POINT', '" + zip + "', '2019-05-09 22:45:33.05+00', '2019-05-09 22:45:33.05+00'), \n";

      // Push into stream & continue
      this.push(fullSql);
    }

    // In either case, move to next
    next();
  }
}
