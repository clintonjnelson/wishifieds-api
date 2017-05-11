'use strict';

var TumblrSign = require('../../models/TumblrSign.js');
var cloneDeep = require('lodash').cloneDeep;

module.exports = function(signBuilder) {

  function buildTumblrSign(tbrProfile) {

    // Rearrange the data for easier usage
    var tbrData = {
      username:  tbrProfile.username,
      id:        tbrProfile.username,
      following: getFollowing(tbrProfile),
      blogs:     getBlogs(tbrProfile),     // all sign sites
      profile:   tbrProfile,
    };
    var signsArray = [];

    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: picUrl, profileId, followers
    // Iterate through each sign site & format apiData
    tbrData.blogs.forEach(function(blog, ind, orig) {
      var newSignData = {};
      // Add specific sign data
      newSignData.knownAs     = blog.name;
      newSignData.description = blog.title;
      // Check for optional icon, and if has one, the get the url from it;  else use the primary user's avatar picture
      newSignData.picUrl      = buildPicUrl(blog.name);
      newSignData.siteId      = blog.name;   // This is the site ID (not primary Wordpress user profile ID)
      newSignData.linkUrl     = blog.url;
      newSignData.profileId   = tbrData.id;  // Really just the username, used as primary ID. Stupid.
      newSignData.followers   = blog.followers;

      var newSign = new TumblrSign(newSignData);

      // Add chunk to API array
      signsArray.push(newSign);
    });

    var multiSignProfile        = cloneDeep(tbrProfile);  // use this as a base object
    multiSignProfile.multiSigns = signsArray;               // add multiSigns array onto base
    console.log("FINAL BUNCH OF MULTISIGN + PROFILE IS: ", multiSignProfile);
    return multiSignProfile;
  }

  signBuilder.tumblr = buildTumblrSign;
};

function getFollowing(tbr) {
  try { return tbr._json.response.user.following; }
  catch (e) {
    console.log('Error accessing data for Tumblr following: ', e);
    return {}; // return empty object - avoid later errors
  }
}

function getBlogs(tbr) {
  try { return tbr._json.response.user.blogs; }
  catch (e) {
    console.log('Error accessing data for Tumblr blogs: ', e);
    return []; // return empty object - avoid later errors
  }
}

function buildPicUrl(blogname) {
  return 'https://api.tumblr.com/v2/blog/' + blogname + '.tumblr.com/avatar';
}
