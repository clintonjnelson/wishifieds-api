'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js');

// New schema ffrom base
var youtubeSignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
youtubeSignSchema.add({
  bgColor:     { type: String, default: '#bb0000' },
  icon:        { type: String, default: 'youtube' },
  signType:    { type: String, default: 'google'  },
  profileId:   { type: String, required: true     },
});

// Validations
googleSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('YoutubeSign', youtubeSignSchema);
