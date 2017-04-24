'use strict';

var EtsySign = require('../../models/EtsySign.js');

module.exports = function(signBuilder) {

  function buildEtsySign(etsyData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: bgColor, followers, etsyId, picUrl, icon, signType
    // NOTE: most not needed OR covered by defaults
    console.log("DATA FOR MAPPING IS: ", etsyData);
    var signProps = {
      // ----------------- BASE -----------------------
      // description:    etsyData.description,                      // optional for updates?
      knownAs:        (etsyData.profile.name        || etsyData.knownAs),  // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        (buildLinkUrl(etsyData.profile.name)  || etsyData.linkUrl),  // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      profileId:      etsyData.profile.id,
      picUrl:         etsyData.results[0]['image_url_75x75'],
    };

    var newEtsySign = new EtsySign(signProps);

    return newEtsySign;
  }

  function buildLinkUrl(username) {
    return 'https://' + username + '.etsy.com/';
  }

  signBuilder.etsy = buildEtsySign;
};
