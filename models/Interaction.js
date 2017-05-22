'use strict';

// MAY NEED TO USE THIS AS A BASE CLASS
// EXTEND WITH THE TARGET IDENTIFIER WITH "REF" SPECIFIED FOR EACH TYPE: Sign, User, etc


var mongoose = require('mongoose');

var InteractionSchema = mongoose.Schema({
    guid:             { type: String, required: true },
    targetType:       { type: String, required: true }, // user, sign, etc
    targetIdentifier: { type: String, required: true }, // <userId>, <signId>, etc
    interactorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true });

// export schema
module.exports = mongoose.model('Interaction', InteractionSchema);
