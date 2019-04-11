'use strict';

var eatOnReq   = require('../lib/routes_middleware/eat_on_req.js');
var eatAuth    = require('../lib/routes_middleware/eat_auth.js'  )(process.env.AUTH_SECRET);
// var ownerAuth  = require('../lib/routes_middleware/owner_auth.js');
var bodyparser = require('body-parser');
var cheerio    = require('cheerio');
var superagent = require('superagent');

var Images    = require('../db/models/index.js').Image;
var Sequelize = require('sequelize');
var multer    = require('multer');
var uuid      = require('uuid/v4');
var multerS3  = require('multer-s3');
var s3Utils   = require('../lib/s3Utils.js');
var s3ImagesUpload = multer({
  storage: multerS3({
    s3: s3Utils.defaultS3(),
    bucket: process.env.WISHIFIEDS_S3BUCKET,
    acl: 'public-read',
    metadata: function(req, file, metaCallback) {
      metaCallback(null, {fieldName: file.fieldname});  // TODO: Update this for userul stuff
    },
    key: function(req, file, keyCallback) {
      console.log("FILE in KEY is: ", file);
      var imageToken = uuid();
      var baseKeyName = 'images/listings/' + imageToken + '.';  // TODO: CHANGE THIS TO A SAVABLE TOKEN!
      var fileExtension = s3Utils.getImageExtension([file.filename, file.originalname]);
      var bucketKeyName = baseKeyName + fileExtension;
      keyCallback(null, bucketKeyName);
    },
  }),
  limits: {
    fileSize: 3000000
  }
});

module.exports = function(router) {
  // Use bodyparser JSON for rest of endpoints
  router.use(bodyparser.json());

  // POST because needs to send a full URL
  // Takes a URL and returns a unique array of the image URLs on that page!
  // TODO: GO THROUGH & RENAME THINGS TO BETTER DESCRIBE THE FLOW OF DATA
  // TODO: SCRUB THE IMAGES OR REMOVE ANY SCRIPT-TYPE CONTENT FROM THEM.
  router.post('/external/getimages', function(req, res) {
    if(process.env.ENVIRONMENT === 'offline') {
      return res.json({urls: [
        '/assets/profile_default.png',
        '/assets/profile_default.png',
        '/assets/profile_default.png'
        ]});
    }
    else {
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
    }
  });

  // Upload images for listings
  // NOTE: UI only sends one image at a time
  router.post('/images/listings/upload',
    eatOnReq,
    eatAuth,
    // ownerAuth,  // TODO: Do we want to make this a Listings endpoint?
    bodyparser.urlencoded({ extended: true }),
    handleOfflineProcessing,
    s3ImagesUpload.array('listingimages', 30),
    function(req, res) {
      console.log("USER ON REQ IS: ", req.user);
      console.log("SUCCESSFULLY UPLOADED TO S3. NOW NEED TO SAVE TOKEN FILE NAME LOCALLY!!");
      console.log("Body is: ", req.body);
      console.log("NUMBER OF FILES IS: ", req.files.length);
      var userId = req.user.id;

      var s3ImageUrls = req.files.map(function(file, index, orig) {
        console.log("FILE NUMBER ", index, " IS: ", file);
        return file.location;
      });

      // DON"T yet save the images in the DB
      // For images that don't end up getting kept, we will have a Lambda clean out

      // Return the saved urls array
      res.json({savedImages: s3ImageUrls});
  });


  //---------------------- HELPERS ----------------------
  function imagesFilter(url) {
    return url &&
      url.includes('http') &&
      !url.includes('www.w3.org');
  }

  function handleOfflineProcessing(req, res, next) {
    if(process.env.ENVIRONMENT) {
      return res.json({savedImages: ['/assets/profile_default.png']});
    }
    else {
      next();
    }
  }
}

