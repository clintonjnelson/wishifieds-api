'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// New schema from base
var etsySignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
etsySignSchema.add({
  bgColor:         { type: String, default: '#d15600' },
  icon:            { type: String, default: 'etsy'    },
  profileId:       { type: String, required: true     },
  signType:        { type: String, default: 'etsy'    },
});

// Validations
etsySignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('EtsySign', etsySignSchema);
