'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// New schema from base
var instagramSignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
instagramSignSchema.add({
  bgColor:          { type: String, default: '#675144'     },
  icon:             { type: String, default: 'instagram'   },
  profileId:        { type: String, required: true         },
  signType:         { type: String, default: 'instagram'   },
});

// Validations
instagramSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('InstagramSign', instagramSignSchema);
