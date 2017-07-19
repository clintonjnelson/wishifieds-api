'use strict';
var fs                  = require('fs');
var log                 = require('../logging/logging.js').log;
var SitemapUrlTransform = require('../stream_transforms/SitemapUrlTransform.js')
var User                = require('../../models/User.js');


// Callback format: callback(error)
module.exports = function(req, callback) {
  try {
    // Initialize write stream
    console.log('Opening the write stream to file...');
    var sitemapPath = __dirname + '/../../client/dist/sitemap.txt';
    var writeStream = fs.createWriteStream(sitemapPath, {flags: 'w'});

    // Initialize transform
    var sitemapUrlTransform = new SitemapUrlTransform(req, {encoding: 'utf8', objectMode: true});

    // Open write Stream
    console.log('Querying users for piping...');
    var userStream = User.find()
      .sort('username')
      .cursor()
      .pipe(sitemapUrlTransform)
      .pipe(writeStream);

    // Stream Listeners
    writeStream.on('finish', function() {
      console.log('Finished building sitemap.');
      log('task', 'Sitemap successfully updated. :-) ', 'success');

      callback(null);  // no error
    });
  }
  catch(e) {
    console.log("Error writing streams for sitemap build update:", e);
    log('task', 'Sitemap failed to update. :-( ', 'error');

    callback('Error updating sitemap.'); // pass error message
  }
}
