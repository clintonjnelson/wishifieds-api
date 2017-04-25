'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// New schema from base
var pinterestSignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
pinterestSignSchema.add({
  bgColor:         { type: String, default: '#cb2027'          },
  icon:            { type: String, default: 'pinterest'        },
  followersCount:  { type: String,                             },
  profileId:       { type: String, required: true              },
  signType:        { type: String, default: 'pinterest'        },
});

// Validations
pinterestSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('PinterestSign', pinterestSignSchema);
