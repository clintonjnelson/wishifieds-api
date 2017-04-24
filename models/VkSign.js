'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// New schema from base
var vkSignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
vkSignSchema.add({
  bgColor:         { type: String, default: '#45668e' },
  icon:            { type: String, default: 'vk'      },
  profileId:       { type: String, required: true     },
  signType:        { type: String, default: 'vk'      },
});

// Validations
vkSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('VkSign', vkSignSchema);
