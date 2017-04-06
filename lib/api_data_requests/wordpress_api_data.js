'use strict';

var request     = require('superagent');
var _           = require('lodash');
var signBuilder = require('../sign_builder.js');
var signType    = 'wordpress';
/*
  accessToken used for API requests to get more data
  Profile exists as an alternate to API request when info is adequate
  Module returns callback with error or Array of data
*/
module.exports = function getWordpressInfo(accessToken, wpProfile, callback) {

  // profile.user has the key sign data
  if(!wpProfile && !wpProfile._json) {
    console.log('Error: No profile info received.');
    return callback('No wordpress profile info received.', null);
  }
  var newSignData;
  var signsArray = [];

  // Base data OK. Get rest of data.
  request
    .get('https://public-api.wordpress.com/rest/v1.1/me/sites')
    .set('Authorization', ('BEARER ' + accessToken))
    .end(apiCallback);

  function apiCallback(err, res) {
    if(err) {
      console.log('Error getting signs info from Wordpress. Error: ', err);
      return callback( ('Wordpress Error: ' + err), null);
    }
    var sites = (res.body && res.body.sites ? res.body.sites : null);

    // Iterate through each sign site & format apiData
    sites.forEach(function(elem, ind, orig) {
      newSignData = {};
      // Add specific sign data
      newSignData.knownAs     = elem.name;
      newSignData.description = elem.description;
      // Check for optional icon, and if has one, the get the url from it;  else use the primary user's avatar picture
      newSignData.picUrl      = (elem.icon && elem.logo.url) || wpProfile.avatar_URL;
      newSignData.siteId      = elem.ID;   // This is the site ID (not primary Wordpress user profile ID)
      newSignData.linkUrl     = elem.URL;
      newSignData.profileId   = wpProfile.ID;

      var newSign = signBuilder[signType](newSignData);

      // Add chunk to API array
      signsArray.push(newSign);
    });

    var multiSignData        = _.cloneDeep(wpProfile);  // use this as a base object
    multiSignData.multiSigns = signsArray;              // add multiSigns array onto base
    console.log("FINAL BUNCH OF MULTISIGN INFO WITH PRIMARY DATA IS: ", multiSignData);
    return callback(null, multiSignData);
  }
};
