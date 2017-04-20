'use strict';

var request     = require('superagent');
var _           = require('lodash');
var signBuilder = require('../sign_builder.js');
var signType    = 'tumblr';
/*
  accessToken used for API requests to get more data
  Profile exists as an alternate to API request when info is adequate
  Module returns callback with error or Array of data
*/
module.exports = function getWordpressInfo(accessToken, tbrProfile, callback) {

  // profile.user has the key sign data
  if(!tbrProfile && !tbrProfile._json) {
    console.log('Error: No profile info received.');
    return callback('No wordpress profile info received.', null);
  }

  // Rearrange the data for easier usage
  var tbrData = {
    username:  tbrProfile.username,
    id:        tbrProfile.username,
    following: tbrProfile._json.response.user.following,
    blogs:     tbrProfile._json.response.user.blogs,     // all sign sites
    profile:   tbrProfile,
    // linkUrl:     profile._json.response.user.blogs[0].url,
    // description: profile._json.response.user.blogs[0].title,
  };

  var signsArray = [];

////// WE SHOULD INSTEAD USE THE MAPPER HERE IN PLACE OF LOGIC IN API CALL!!!///////
////// MAYBE SHOULD DO THIS IN A STEP A-F-T-E-R THIS IN THE MULTISIGN BUILDER///////
////// MOVE TO MAPPER, RETURN DATA AND MAP IT IN STEP AFTER THIS IN MAPPER/////////

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

    var newSign = signBuilder[signType](newSignData);

    // Add chunk to API array
    signsArray.push(newSign);
  });

  var multiSignProfile        = _.cloneDeep(tbrProfile);  // use this as a base object
  multiSignProfile.multiSigns = signsArray;               // add multiSigns array onto base
  console.log("FINAL BUNCH OF MULTISIGN + PROFILE IS: ", multiSignProfile);
  return callback(null, multiSignProfile);
};

function buildPicUrl(blogname) {
  if(blogname) {
    return 'https://api.tumblr.com/v2/blog/' + blogname + '.tumblr.com/avatar';
  }
  return '';
}

// Example API Data - ALL of it already comes in profile
/*
{ provider: 'tumblr',
  username: 'clintonjnelson',
  _raw: '{"meta":{"status":200,"msg":"OK"},"response":{"user":{"name":"clintonjnelson","likes":0,"following":1,"default_post_format":"html","blogs":[{"admin…
  _json: {
    meta: { status: 200, msg: 'OK' },
    response:
     { user:
        { name: 'clintonjnelson',
          likes: 0,
          following: 1,
          default_post_format: 'html',
          blogs: [
            { admin: true,
              ask: false,
              ask_anon: false,
              ask_page_title: 'Ask me anything',
              can_send_fan_mail: true,
              can_subscribe: false,
              description: '',
              drafts: 0,
              facebook: 'N',
              facebook_opengraph_enabled: 'N',
              followed: false,
              followers: 0,
              is_adult: false,
              is_blocked_from_primary: false,
              is_nsfw: false,
              likes: 0,
              messages: 0,
              name: 'clintonjnelson',
              placement_id: '',
              posts: 0,
              primary: true,
              queue: 0,
              reply_conditions: 3,
              share_likes: true,
              subscribed: false,
              title: 'Untitled',
              total_posts: 0,
              tweet: 'N',
              twitter_enabled: false,
              twitter_send: false,
              type: 'public',
              updated: 0,
              url: 'https://clintonjnelson.tumblr.com/'
            }
          ]
        }
      }
    }
  }
}
*/
