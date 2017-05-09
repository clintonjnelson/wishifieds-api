'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// New schema from base
var patreonSignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
patreonSignSchema.add({
  bgColor:         { type: String, default: '#e6461a'  },
  icon:            { type: String, default: 'patreon'  },
  profileId:       { type: String, required: true      },
  signType:        { type: String, default: 'patreon'  },
});

// Validations
patreonSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('PatreonSign', patreonSignSchema);
