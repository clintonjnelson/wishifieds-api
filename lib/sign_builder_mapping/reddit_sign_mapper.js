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
      knownAs:        (rdtData.displayName  || rdtData.knownAs),      // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        (rdtData._json.url    || rdtData.linkUrl),      // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      profileId:      rdtData.id,
      picUrl:         rdtData._json.image.url,
    };

    var newRedditSign = new RedditSign(signProps);

    return newRedditSign;
  }

  signBuilder.reddit = buildRedditSign;
};
