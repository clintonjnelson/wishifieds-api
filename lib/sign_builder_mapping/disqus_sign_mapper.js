'use strict';

var DisqusSign = require('../../models/DisqusSign.js');

module.exports = function(signBuilder) {

  function buildDisqusSign(dqsData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: bgColor, followers, disqusId, picUrl, icon, signType
    // NOTE: most not needed OR covered by defaults

    var signProps = {
      // ----------------- BASE -----------------------
      // description:    dqsData.description,                      // optional for updates?
      knownAs:        (dqsData.displayName || dqsData.knownAs),  // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        (dqsData._json.response.profileUrl || dqsData.linkUrl),  // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      followersCount: dqsData._json.response.numFollowing,
      profileId:      dqsData.id,
      picUrl:         dqsData._json.response.avatar.small.permalink,
    };

    var newDisqusSign = new DisqusSign(signProps);

    return newDisqusSign;
  }

  signBuilder.disqus = buildDisqusSign;
};
