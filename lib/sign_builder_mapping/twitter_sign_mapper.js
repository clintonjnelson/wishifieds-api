'use strict';

var TwitterSign   = require('../../models/TwitterSign.js');

module.exports = function(signBuilder) {

  function buildTwitterSign(twData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: followersCount, friendsCount, profileBgColor, twitterPicUrl, twitterId
    console.log("TWITTER DATA RECEIVED IS: ", twData);
    var signProps = {
      // ----------------- BASE -----------------------
      // description:    fbData.description,                // optional for updates?
      knownAs:        buildKnownAs(twData._json.screen_name),      // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        buildLinkUrl(twData.id), // Update unless passing new
      // ----------------- CUSTOM ---------------------
      followersCount: twData._json.followers_count,
      friendsCount:   twData._json.friends_count,
      profileId:      twData.id,
      picUrl:         twData._json.profile_image_url,
    };

    // Load schema data into new twitter sign
    var newTwitterSign = new TwitterSign(signProps);


    return newTwitterSign;
  }
  function buildKnownAs(name) { return '@' + name; }
  function buildLinkUrl(id)   { return 'https://twitter.com/intent/user?user_id=' + id; }

  signBuilder.twitter = buildTwitterSign;
};
