'use strict';

var RedditSign = require('../../models/RedditSign.js');

module.exports = function(signBuilder) {

  function buildRedditSign(rdtData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: bgColor, circledByCount, profileId, picUrl, icon, signType
    console.log("REDDIT DATA RECEIVED IS: ", rdtData);
    var signProps = {
      // ----------------- BASE -----------------------
      // description:    rdtData.description,                // optional for updates?
      knownAs:        (rdtData.name            || rdtData.knownAs),      // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        (buildUrl(rdtData.name) || rdtData.linkUrl),      // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      profileId:      rdtData.id,
      // picUrl:         undefined,
    };

    var newRedditSign = new RedditSign(signProps);

    return newRedditSign;
  }

  function buildUrl(username) {
    return 'https://www.reddit.com/user/' + username;
  }

  signBuilder.reddit = buildRedditSign;
};
