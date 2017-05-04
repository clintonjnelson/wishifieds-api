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
      linkUrl:        (getLinkUrl(vmoData) || vmoData.linkUrl),  // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      // followers:      vmoData._json.followers,
      profileId:      vmoData.id,
      picUrl:         getPicUrl(vmoData),  // 75x75 profile pic
    };

    var newVimeoSign = new VimeoSign(signProps);

    return newVimeoSign;
  }

  function getLinkUrl(vmo) {
    try { return vmo._json.link; }
    catch (e) {
      console.log('Data access error for Vimeo linkUrl: ', e);
      return '';
    }
  }

  function getPicUrl(vmo) {
    try { return vmo._json.pictures[1].link; }
    catch (e) {
      console.log('Data access error for Vimeo picUrl: ', e);
      return '';
    }
  }

  signBuilder.vimeo = buildVimeoSign;
};
