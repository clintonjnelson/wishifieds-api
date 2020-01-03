'use strict';

var adminAuth     = require('../lib/routes_middleware/admin_auth.js');
var bodyparser    = require('body-parser');
var eatAuth       = require('../lib/routes_middleware/eat_auth.js'  )(process.env.AUTH_SECRET);
var eatOnReq      = require('../lib/routes_middleware/eat_on_req.js');
var updateSitemap = require('../lib/tasks/updateSitemap.js');
// var cheerio       = require('cheerio');
// var superagent    = require('superagent');

module.exports = function(router) {
  router.use(bodyparser.json());

  // This creates the sitemap and this must be done each time the site is launched
  // because the file is deleted each time (container teardown/rebuild). Google
  // NEEDS to be able to find this sitemap to update its records.
  router.put('/tasks/sitemap', eatOnReq, eatAuth, adminAuth, function(req, res) {

    if(req.body.trigger === true) {
      // Update Sitemap
      updateSitemap(req, function(error) {
        if(error) { return res.status(500).json({success: false, error: true}); }

        return res.status(200).json({success: true, error: false});
      });
    }
    else {
      return res.status(500).json({success: false, error: true});
    }
  });

  // Takes a URL and returns a unique array of the image URLs on that page!
  // TODO: GO THROUGH & RENAME THINGS TO BETTER DESCRIBE THE FLOW OF DATA
  // router.post('/tasks/getimages', function(req, res) {
  //   if(process.env.ENVIRONMENT === 'offline') {
  //     return res.json({urls: [
  //       '/assets/profile_default.png',
  //       '/assets/profile_default.png',
  //       '/assets/profile_default.png'
  //       ]});
  //   }
  //   else {
  //     const url = req.body.url; // req.body.url.trim();
  //     superagent
  //       .get(url)
  //       .end( function(reqq, ress) {

  //         // console.log("BODY: ", ress.text);
  //         const $ = cheerio.load(ress.text);

  //         const imgTags = $('img');
  //         console.log(imgTags);

  //         var keys = Object.keys(imgTags);

  //         const want = keys.map( key => {
  //           var imgTag = imgTags[key];
  //           if(imgTag.namespace && imgTag.attribs && imgTag.attribs.src) {
  //             var imgUrl = imgTag.namespace + imgTag.attribs.src;
  //             return imgUrl;
  //           }
  //         });
  //         const results = Array.from(new Set(want));
  //         const limited = results.filter( url => url && url.includes('http'));
  //         console.log("Final", limited);

  //         res.json({urls: limited})
  //       });
  //   }
  // });
}

