'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// New schema from base
var amazonSignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
amazonSignSchema.add({
  bgColor:         { type: String, default: '#ff9900'  },
  icon:            { type: String, default: 'amazon'  },
  profileId:       { type: String, required: true      },
  signType:        { type: String, default: 'amazon'  },
});

// Validations
amazonSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('AmazonSign', amazonSignSchema);
