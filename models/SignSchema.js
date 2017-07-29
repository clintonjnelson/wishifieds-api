'use strict';

var mongoose = require('mongoose');
var util     = require('util'    );

// TODO: refactor using more-functional/less-classical syntax
function SignSchema() {
  mongoose.Schema.apply(this, arguments);

  // Schema fields
  this.add({
    customBgColor:  { type: String, default: null                      }, // custom sign color
    description:    { type: String                                     }, // sign desc (opt)
    knownAs:        { type: String                                     }, // username ref
    linkUrl:        { type: String                                     }, // link to site
    order:          { type: Number, default: null                      }, // for ordering signs
    picUrl:         { type: String                                     }, // link to image (opt)
    status:         { type: String, default: "A"                       }, // Valid Statuses: 'A' (active), 'D' (deleted)
    userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' , required: true},  // needed for ALL Signs
    createdAt:      { type: Date,   default: Date.now()                },
    updatedAt:      { type: Date,   default: Date.now()                },
  });
  // Fields for CUSTOM schemas: bgColor, signType, icon
}

util.inherits(SignSchema, mongoose.Schema);  // extend mongoose Schema

// Export Schema for use
module.exports = SignSchema;
