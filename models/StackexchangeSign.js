'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// New schema from base
var stackexchangeSignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
stackexchangeSignSchema.add({
  badgeCounts:      { type: Object                             },
  bgColor:          { type: String, default: '#5184C1'         },
  icon:             { type: String, default: 'stack-overflow'   },
  location:         { type: String                             },
  profileId:        { type: String, required: true             },
  reputation:       { type: String                             },
  signIdentifier:   { type: String, required: true             },
  signType:         { type: String, default: 'stackexchange'   },
});

// Validations
stackexchangeSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('StackexchangeSign', stackexchangeSignSchema);
