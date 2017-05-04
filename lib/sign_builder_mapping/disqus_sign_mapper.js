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
      linkUrl:        (getLinkUrl(dqsData) || dqsData.linkUrl),  // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      followersCount: getFollowersCount(dqsData),
      profileId:      dqsData.id,
      picUrl:         getPicUrl(dqsData),
    };

    var newDisqusSign = new DisqusSign(signProps);

    return newDisqusSign;
  }

  function getLinkUrl(dqs) {
    try { return dqs._json.response.profileUrl; }
    catch (e) {
      console.log('Data access error for Disqus linkUrl: ', e);
      return '';
    }
  }

  function getFollowersCount(dqs) {
    try { return dqs._json.response.numFollowing; }
    catch (e) {
      console.log('Data access error for Disqus followersCount: ', e);
      return '';
    }
  }

  function getPicUrl(dqs) {
    try { return dqs._json.response.avatar.small.permalink; }
    catch (e) {
      console.log('Data access error for Disqus picUrl: ', e);
      return '';
    }
  }

  signBuilder.disqus = buildDisqusSign;
};
