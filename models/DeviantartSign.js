'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// New schema from base
var deviantartSignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
deviantartSignSchema.add({
  bgColor:         { type: String, default: '#b3c432' },
  followersCount:  { type: String                     },
  icon:            { type: String, default: 'deviantart'  },
  profileId:       { type: String, required: true     },
  signType:        { type: String, default: 'deviantart'  },
});

// Validations
deviantartSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('DeviantartSign', deviantartSignSchema);
