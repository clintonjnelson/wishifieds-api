'use strict';

var AmazonSign = require('../../models/AmazonSign.js');

module.exports = function(signBuilder) {

  function buildAmazonSign(amznData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: bgColor, followers, amazonId, picUrl, icon, signType
    // NOTE: most not needed OR covered by defaults

    console.log("AMAZON MAPPING DATA AVAILABLE IS: ", amznData);

    var signProps = {
      // ----------------- BASE -----------------------
      // description:    amznData.description,                      // optional for updates?
      knownAs:        (amznData.displayName || amznData.knownAs),  // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        (amznData.url         || amznData.linkUrl),  // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      profileId:      amznData.id,
      picUrl:         amznData.imageUrl,  // No pic for Amazon user profile
    };

    var newAmazonSign = new AmazonSign(signProps);

    return newAmazonSign;
  }

  signBuilder.amazon = buildAmazonSign;
};
