'use strict';

var urlParser = require('url');
var eatOnReq   = require('../lib/routes_middleware/eat_on_req.js');
var eatAuth    = require('../lib/routes_middleware/eat_auth.js'  )(process.env.AUTH_SECRET);
var bodyparser = require('body-parser');
const puppeteer = require('puppeteer');
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
const httpRegex = /(?<=\(|\("|\(')(http.*?(?=\)|"\)|'\)))/igm;

module.exports = function(router) {
  // Use bodyparser JSON for rest of endpoints
  router.use(bodyparser.json());

  // TODO: Optimize this for better performance.
  // POST because needs to send a full URL
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
        const fullPageLoadHtml = await page.content();

        const parsedImgs = [];
        const regex = /((?<=(="|:"))([^"]*(\.png|\.jpg|\.jpeg|\.bmp|\.gif|\.tif).*?(?=")))+/igm; //|\.svg Hacking risk

        var result;
        while((result = regex.exec(fullPageLoadHtml)) !== null) {
          if(result.index === regex.lastIndex) { regex.lastIndex; }
          parsedImgs.push(result[0]);
        }

        const results = Array.from(new Set(parsedImgs));

        const limited = results
          .filter( imgUrl => badStuffFilter(imgUrl))  // remove bad stuff
          .map( imgUrl => cleanupUrl(imgUrl, site) )
          .filter( fullUrl => imagesFilter(fullUrl))  // remove junk
          .map( fullUrl => sanitizeUrl(fullUrl)); // sanitize the good

        console.log("Final:", limited);
        browser.close();  // REMOVED AWAIT!! Close, but don't want for success close. Close - fire & forget.
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
  function badStuffFilter(url) {
    return url &&
      !url.includes('javascript:') &&  // BAD
      !url.includes('data:');  // prevent data urls that can have JS injection
  }

  function cleanupUrl(url, site) {
    // look starting with ( or (" or ('  AND ending with the opposite (closing)
    // Make sure it has the "http" in the middle, and grab everything after until closing
    if(url) {
      if(url.startsWith('http')) {
        return url;
      }
      // Sometimes captures CSS that has like "background-image:url(https://website.com/pic.jpg)"; we need to extract just image
      else if(url.includes('http')) {
        let foundUrl;
        while((foundUrl = httpRegex.exec(url)) !== null) {
          if(foundUrl.index === httpRegex.lastIndex) { httpRegex.lastIndex; }
          return foundUrl[0];
        }
      }
      else if(url.startsWith('//')) {
        return ('https:' + url);
      }
      // Add namespace, but filter out later if it's the www.w3.org namespace
      else {
        return site + url;  // image is internal to site & needs to be combined with namespace
      }
    }
    else {
      return url;
    }
  }

  function sanitizeUrl(url) {
    return url.replace(/<>"/g, '');
  }

  function imagesFilter(url) {
    return url &&
      url.includes('http') &&
      !url.includes('www.w3.org');
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

