'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// New schema from base
var disqusSignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
disqusSignSchema.add({
  bgColor:         { type: String, default: '#2e9fff' },
  followersCount:  { type: String                     },
  icon:            { type: String, default: 'disqus'  },
  profileId:       { type: String, required: true     },
  signType:        { type: String, default: 'disqus'  },
});

// Validations
disqusSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('DisqusSign', disqusSignSchema);
