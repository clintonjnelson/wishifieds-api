'use strict';

var VimeoSign = require('../../models/VimeoSign.js');

module.exports = function(signBuilder) {

  function buildVimeoSign(vmoData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: bgColor, followers, vimeoId, picUrl, icon, signType
    // NOTE: most not needed OR covered by defaults

    var signProps = {
      // ----------------- BASE -----------------------
      // description:    vmoData.description,                      // optional for updates?
      knownAs:        (vmoData.displayName || vmoData.knownAs),  // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        (vmoData._json.link  || vmoData.linkUrl),  // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      // followers:      vmoData._json.followers,
      profileId:      vmoData.id,
      picUrl:         vmoData._json.pictures[1].link,  // 75x75 profile pic
    };

    var newVimeoSign = new VimeoSign(signProps);

    return newVimeoSign;
  }

  signBuilder.vimeo = buildVimeoSign;
};
