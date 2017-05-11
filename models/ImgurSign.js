'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// New schema from base
var imgurSignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
imgurSignSchema.add({
  bgColor:         { type: String, default: '#85bf25'          },
  circledByCount:  { type: String                              },
  icon:            { type: String, default: 'imgur'           },
  profileId:       { type: String, required: true              },
  signType:        { type: String, default: 'imgur'           },
});

// Validations
imgurSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('ImgurSign', imgurSignSchema);
