'use strict';
var Transform  = require('stream').Transform;


// Transform Stream that pulls out usename & builds url for the sitemap file
module.exports = class SitemapUrlTransform extends Transform {
  constructor(request, options) {
    super(options);
    this.request = request;
  }

  _transform(chunk, encoding, next) {
    // Create the url from username in chunk
    var username = chunk['username'];
    var urlChunk = this.request.headers.origin + '/' + username + '\n';

    // Push into stream & continue
    this.push(urlChunk);
    next();
  }
}
