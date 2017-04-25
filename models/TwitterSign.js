'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// New schema from base
var twitterSignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
twitterSignSchema.add({
  bgColor:         { type: String, default: '#00aced'     },
  followersCount:  { type: String                         },
  friendsCount:    { type: String                         },
  icon:            { type: String, default: 'twitter'     },
  profileId:       { type: String, required: true         },
  signType:        { type: String, default: 'twitter'     },
});

// Validations
twitterSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('TwitterSign', twitterSignSchema);

