'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js');

// New schema ffrom base
var redditSignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
redditSignSchema.add({
  bgColor:     { type: String, default: '#FF5700' },
  icon:        { type: String, default: 'reddit' },
  signType:    { type: String, default: 'reddit'  },
  profileId:   { type: String, required: true     },
});

// Validations
redditSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('RedditSign', redditSignSchema);
