'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// New schema from base
var vimeoSignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
vimeoSignSchema.add({
  bgColor:         { type: String, default: '#00bf8f' },
  // followersCount:  { type: String                     },
  icon:            { type: String, default: 'vimeo'  },
  profileId:       { type: String, required: true     },
  signType:        { type: String, default: 'vimeo'  },
});

// Validations
vimeoSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('VimeoSign', vimeoSignSchema);
