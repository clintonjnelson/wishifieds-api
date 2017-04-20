'use strict';

var PinterestSign = require('../../models/PinterestSign.js');

module.exports = function(signBuilder) {

  function buildPinterestSign(ptData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: bgColor, circledByCount, profileId, picUrl, icon, signType
    console.log("PINTEREST DATA RECEIVED IS: ", ptData);
    var signProps = {
      // ----------------- BASE -----------------------
      // description:    ptData.description,                // optional for updates?
      knownAs:        (ptData.displayName || ptData.profile.displayName || ptData.knownAs),  // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        (ptData.profile._json.data.url || buildLinkUrl(ptData.data.username) || ptData.linkUrl),      // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      profileId:      ptData.data.id,
      picUrl:         ptData.data.image['60x60'].url,
    };

    var newPinterestSign = new PinterestSign(signProps);

    return newPinterestSign;
  }

  function buildLinkUrl(username) {
    if(username) {
      return 'https://www.pinterest.com/' + username;
    }

    return null;
  }

  signBuilder.pinterest = buildPinterestSign;
};
