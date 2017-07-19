'use strict';

// Not sure if should use this as a base class schema or a polymorphic schema
// Log status: error, success
// Log Type: signup, interaction, search , task


var mongoose = require('mongoose');

var LogSchema = mongoose.Schema({
  logType: { type: String, required: true },
  logMsg:  { type: String                 },
  status:  { type: String                 },
},
  { timestamps: true });


// export schema
module.exports = mongoose.model('Log', LogSchema);
