'use strict';

var fs                  = require('fs');
var es                  = require('event-stream');
var ZipcodeToLocationSqlTranform = require('../lib/stream_transforms/ZipcodeToLocationSqlTransform.js');

try {
  // Initialize readstream
  console.log("CURRENT DIR IS: ", __dirname);
  var sourcefilePath = __dirname + '/../Reference/US/US.txt';
  var readStream = fs.createReadStream(sourcefilePath);

  // Initialize write stream
  console.log('Opening the write stream to file at: ' + __dirname + '/zipcode_json.txt' + '...');
  var sitemapPath = __dirname + '/zipcode_json.txt';
  var writeStream = fs.createWriteStream(sitemapPath, {flags: 'w'});

  // Initialize transform
  var zipToSqlTransform = new ZipcodeToLocationSqlTranform({encoding: 'utf8', objectMode: true});

  // Open write Stream
  readStream
    .pipe(es.split())
    .pipe(zipToSqlTransform)
    .pipe(writeStream)

  // Stream Listeners
  writeStream.on('finish', function() {
    console.log('Finished building zipcode sql.');
  });
}
catch(e) {
  console.log("Error writing zipcode sql:", e);

  callback('Error creating zipcode sql.'); // pass error message
}