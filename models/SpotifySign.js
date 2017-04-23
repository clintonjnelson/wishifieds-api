'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// New schema from base
var spotifySignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
spotifySignSchema.add({
  bgColor:         { type: String, default: '#00e461'          },
  followersCount:  { type: String                              },
  icon:            { type: String, default: 'spotify'           },
  profileId:       { type: String, required: true              },
  signType:        { type: String, default: 'spotify'           },
});

// Validations
spotifySignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('SpotifySign', spotifySignSchema);
