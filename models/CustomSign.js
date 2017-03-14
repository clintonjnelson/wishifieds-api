'use strict';

var mongoose   = require('mongoose'       );
var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// new schema from base
var customSignSchema = new SignSchema();  // direct extending with attrs DOES NOT WORK

// BASE Schema: customBgColor, description, knownAs, linkUrl, published, userId
// use this approach to extend
customSignSchema.add({
  bgColor:        { type: String,  default: '#955251' },  // signpost default color
  customIcon:     { type: String,  default: null      },  // custom icon
  icon:           { type: String,  default: 'label'   },  // default icon
  signName:       { type: String,  required: true     },  // sign identifier
  signType:       { type: String,  default: 'custom'  },  // sign type: 'custom'
});

// Validations?


// Export as Discriminator
module.exports = Sign.discriminator('CustomSign', customSignSchema);
