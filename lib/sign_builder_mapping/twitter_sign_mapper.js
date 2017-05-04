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
      knownAs:        buildKnownAs(getName(twData)),      // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        buildLinkUrl(twData.id), // Update unless passing new
      // ----------------- CUSTOM ---------------------
      followersCount: getFollowersCount(twData),
      friendsCount:   getFriendsCount(twData),
      profileId:      twData.id,
      picUrl:         getPicUrl(twData),
    };

    // Load schema data into new twitter sign
    var newTwitterSign = new TwitterSign(signProps);


    return newTwitterSign;
  }
  function getName(tw) {
    try { return tw._json.screen_name; }
    catch (e) {
      console.log('Data access error for Twitter name: ', e);
      return '';
    }
  }

  function getFollowersCount(tw) {
    try { return tw._json.followers_count; }
    catch (e) {
      console.log('Data access error for Twitter followersCount: ', e);
      return '';
    }
  }

  function getFriendsCount(tw) {
    try { return tw._json.friends_count; }
    catch (e) {
      console.log('Data access error for Twitter friendsCount: ', e);
      return '';
    }
  }

  function getPicUrl(tw) {
    try { return tw._json.profile_image_url; }
    catch (e) {
      console.log('Data access error for Twitter picUrl: ', e);
      return '';
    }
  }

  function buildKnownAs(name) { return '@' + name; }
  function buildLinkUrl(id)   { return 'https://twitter.com/intent/user?user_id=' + id; }

  signBuilder.twitter = buildTwitterSign;
};
