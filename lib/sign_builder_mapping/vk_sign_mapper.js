'use strict';

var VkSign = require('../../models/VkSign.js');

module.exports = function(signBuilder) {

  function buildVkSign(vkData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: bgColor, followers, vkId, picUrl, icon, signType
    // NOTE: most not needed OR covered by defaults

    var signProps = {
      // ----------------- BASE -----------------------
      // description:    vkData.description,                      // optional for updates?
      knownAs:        (vkData.displayName || vkData.knownAs),  // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        (vkData.profileUrl  || vkData.linkUrl),  // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      profileId:      vkData.id,
      picUrl:         getPicUrl(vkData),
    };

    var newVkSign = new VkSign(signProps);

    return newVkSign;
  }

  function getPicUrl(vk) {
    try { return vk._json.photo; }
    catch (e) {
      console.log('Data access error for VK picUrl: ', e);
      return '';
    }
  }

  signBuilder.vk = buildVkSign;
};
