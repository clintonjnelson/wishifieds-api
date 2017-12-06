'use strict';

// MAY NEED TO USE THIS AS A BASE CLASS
// EXTEND WITH THE TARGET IDENTIFIER WITH "REF" SPECIFIED FOR EACH TYPE: Sign, User, etc


var mongoose = require('mongoose');

var InteractionSchema = mongoose.Schema({
    guid:             { type: String, required: true },
    targetCategory:   { type: String, required: true },  // user, sign, etc
    targetIdentifier: { type: String, required: true },  // <userId>, <signId>, etc
    targetType:       { type: String, default:  null },  // 'facebook', 'twitter', etc where applicable
    interactorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    eventDate:        { type: Date,   required: true },
  },
  { timestamps: true }
);

// Instead of writing a validator (inefficient), just ensure uniqueness on 2-fields
// This will ensure there is only one guid per date logged
InteractionSchema.index({guid: 1, eventDate: 1, targetCategory: 1, targetType: 1}, {unique: true});

// export schema
module.exports = mongoose.model('Interaction', InteractionSchema);


// Checking for errors in insuring index (found!):
// var Interactions = module.exports = mongoose.model('Interaction', InteractionSchema);
// Interactions.ensureIndexes(function(err) {
//   console.log('ENSURE INDEX');
//   if(err) { console.log(err); }
// });
// Alternate method is to listen to the indexing command for any errors:
// Model.on('index', function(error) { /* log error */ });
