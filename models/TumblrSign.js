'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// New schema from base
var tumblrSignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
tumblrSignSchema.add({
  bgColor:         { type: String, default: '#35465c'     },
  icon:            { type: String, default: 'tumblr'      },
  profileId:       { type: String, required: true         },
  signType:        { type: String, default: 'tumblr'      },
  followers:       { type: String, default: null          },
  siteId:          { type: String                         },
});

// Validations
tumblrSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('TumblrSign', tumblrSignSchema);

