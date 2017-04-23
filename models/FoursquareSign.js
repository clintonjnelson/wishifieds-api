'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// New schema from base
var foursquareSignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
foursquareSignSchema.add({
  bgColor:         { type: String, default: '#0072b1'          },
  icon:            { type: String, default: 'foursquare'       },
  profileId:       { type: String, required: true              },
  signType:        { type: String, default: 'foursquare'       },
  friendsCount:    { type: String                              },
});

// Validations
foursquareSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('FoursquareSign', foursquareSignSchema);
