'use strict';

var bodyparser    = require('body-parser');
var cheerio       = require('cheerio');
var superagent    = require('superagent');

module.exports = function(router) {
  router.use(bodyparser.json());

  // POST because needs to send a full URL
  // Takes a URL and returns a unique array of the image URLs on that page!
  // TODO: GO THROUGH & RENAME THINGS TO BETTER DESCRIBE THE FLOW OF DATA
  // TODO: SCRUB THE IMAGES OR REMOVE ANY SCRIPT-TYPE CONTENT FROM THEM.
  router.post('/external/getimages', function(req, res) {
    const url = req.body.url.trim(); // req.body.url
    superagent
      .get(url)
      .end( function(reqq, ress) {

        // console.log("BODY: ", ress.text);
        const $ = cheerio.load(ress.text);

        const imgTags = $('img');
        console.log(imgTags);

        var keys = Object.keys(imgTags);

        const want = keys.map( key => {
          var imgTag = imgTags[key];
          // FIXME: HERE IF THE ATTRIBS HAS HTTP/HTTPS ALREADY IN THE NAME, THEN DON"T ADD NAMESPACE
          // IF ATTRIBS.SRC DOES N-O-T HAVE THE HTTP/HTTPS IN THE NAME, THEN COMBINE
          if(imgTag.namespace && imgTag.attribs && imgTag.attribs.src) {
            // TODO: Fix, since does not capture image links attached to "data-src=_____"
            if(imgTag.attribs.src.includes('http')) {
              return imgTag.attribs.src;  // image url is complete (ie: externally saved)
            }
            else {
              return imgTag.namespace + imgTag.attribs.src;  // image is internal to site & needs to be combined with namespace
            }
          }
        });
        const results = Array.from(new Set(want));
        const limited = results.filter( url => imagesFilter(url));
        console.log("Final", limited);

        res.json({urls: limited})
      });
  });

  function imagesFilter(url) {
    return url &&
      url.includes('http') &&
      !url.includes('www.w3.org');
  }
}

