'use strict';

var urlParser = require('url');
var eatOnReq   = require('../lib/routes_middleware/eat_on_req.js');
var eatAuth    = require('../lib/routes_middleware/eat_auth.js'  )(process.env.AUTH_SECRET);
// var ownerAuth  = require('../lib/routes_middleware/owner_auth.js');
var bodyparser = require('body-parser');
var cheerio    = require('cheerio');
const puppeteer = require('puppeteer');
// var juice = require('juice');
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
      console.log("IN OFFLINE MODE - returning mock local images as external.")
      return res.json({urls: [
        '/assets/profile_default.png',
        '/assets/profile_default.png',
        '/assets/profile_default.png'
        ]});
    }
    else {
      console.log("ABOUT TO SCRAPE...");
      const url = req.body.url.trim(); // req.body.url
      const parsed = urlParser.parse(url);
      const site = parsed.protocol + '//' + parsed.host;  // https://somesite.com:777

      // TODO: Break out to ASYNC callable function that returns img urls. DONE?
      // https://nodejs.org/ja/docs/guides/dont-block-the-event-loop/
      async function scrape(callback) {
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        await page.goto(url);
        const pupHtml = await page.content();

        // Cheeio taking the puppeteer built HTML (via JS)
        const $c = cheerio.load(pupHtml);

        // Get all of the background image urls from their css attributes
        // Example: www.discoverboating.com
        const bkgImgTags = $c('*').attr('style', 'background-image');
        const bkgrnds = Object.keys(bkgImgTags).map( key => {
          var elem = bkgImgTags[key];
          // TODO: MAYBE GET MORE FORMATS THAN JUST 'data-src'??
          var src = elem.attribs && elem.attribs['data-src'];
          if(src) {
            if(src.includes('http')) {
              return src;
            }
          }
        });

        // Parse via regex because JQuery not pulling reliably...
        // Examples: shop.nordstrom.com
        const parsedCssImgs = [];
        const regex = /((?<="ImageUrl":")((\\"|[^"])*)(?="))+/igm;
        var result;
        while((result = regex.exec(pupHtml)) !== null) {
          if(result.index === regex.lastIndex) { regex.lastIndex; }
          parsedCssImgs.push(result[0]);
        }

        // Get all of the html img tag url src's
        // Example: https://www.gap.com/ (JS loaded)
        const imgTags = $c('img');
        // console.log("IMG TAGS FROM SITE ARE: ", imgTags);
        const want = Object.keys(imgTags).map( key => {
          var imgTag = imgTags[key];
          var src = imgTag && imgTag.attribs && getSrcFromAttribs(imgTag.attribs);
          if(src) {
            // TODO: Fix, since does not capture image links attached to "data-src=_____"
            if(src.includes('http')) {
              return src;  // image url is complete (ie: externally saved)
            }
            else if(src.startsWith('//')) {
              return ('https:' + src);
            }
            // Add base site into to src routing info
            else {
              return site + imgTag.attribs.src;  // image is internal to site & needs to be combined with namespace
            }
          }
        });

        // Combine results
        const resultsImg = Array.from(new Set(want));
        const resultsCss = Array.from(new Set(parsedCssImgs));
        const resultsBkg = Array.from(new Set(bkgrnds));
        var results = resultsImg.concat(resultsCss).concat(resultsBkg);

        const limited = results.filter( url => imagesFilter(url));
        console.log("Final:", limited);
        browser.close();  // REMOVED AWAIT!!
        callback(limited);
      }

      scrape(function(foundUrls) {
        console.log("FOUND SCRAPE RESULTS:::::", foundUrls);
        res.json({urls: foundUrls});
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

  function getSrcFromAttribs(attribs) {
    return attribs.src ||
      attribs['data-src'] ||
      attribs['data-lazysrc'];
  }

  function handleOfflineProcessing(req, res, next) {
    if(process.env.ENVIRONMENT === 'offline') {
      return res.json({savedImages: ['/assets/profile_default.png']});
    }
    else {
      next();
    }
  }
}

