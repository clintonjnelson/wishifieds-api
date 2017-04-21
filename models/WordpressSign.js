'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// New schema from base
var wordpressSignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
wordpressSignSchema.add({
  bgColor:         { type: String, default: '#21759b'     }, //#21759b (blue) #d54e21 (orange)
  icon:            { type: String, default: 'wordpress'   },
  profileId:       { type: String, required: true         },  // Primary Wordpress Shared User ID
  siteId:          { type: String, required: true         },  // ID of specific multi sign site; can be shared among multiple people...
  signType:        { type: String, default: 'wordpress'   },
});

// Validations
wordpressSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('WordpressSign', wordpressSignSchema);

