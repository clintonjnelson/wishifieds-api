'use strict';

var mongoose   = require('mongoose'       );
var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// new schema from base
var genericSignSchema = new SignSchema();  // direct extending with attrs DOES NOT WORK

// BASE Schema: genericBgColor, description, knownAs, linkUrl, published, userId
// use this approach to extend
genericSignSchema.add({
  bgColor:        { type: String,  default: '#955251' },  // signpost default color
  // customIcon:     { type: String,  default:  null     },  // generic icon //// DO WE NEED THIS??? JUST OVERWRITE.
  icon:           { type: String,  default: 'label'   },  // default icon
  signName:       { type: String,  required: true     },  // sign identifier
  signType:       { type: String,  default: 'generic' },  // sign type: 'generic'
});

// Validations?
// Always update when saving
genericSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('genericSign', genericSignSchema);
