'use strict';
var Log = require('../../models/Log.js');


module.exports = {
  log: buildLog
}

function buildLog(type, msg, status) {
  new Log({ logType: type, logMsg:  msg, status: status}).save(function(err) {
    if(err) { console.log('Error logging: ', err); }
  });
}
