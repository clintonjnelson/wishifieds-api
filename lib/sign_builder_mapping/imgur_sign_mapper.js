'use strict';

var ImgurSign = require('../../models/ImgurSign.js');

module.exports = function(signBuilder) {

  function buildImgurSign(imgurData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: bgColor, followers, imgurId, picUrl, icon, signType
    // NOTE: most not needed OR covered by defaults
    console.log("SEEMS LIKE MAPPING COULD BE WRONG USING URL FOR NAME. PROFILE IS: ", imgurData);

    var signProps = {
      // ----------------- BASE -----------------------
      // description:    imgurData.description,                      // optional for updates?
      knownAs:        (imgurData.url || imgurData.knownAs),  // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        (buildLinkUrl(imgurData.url)  || imgurData.linkUrl),  // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      profileId:      imgurData.id,
      picUrl:         null,  // No pic for Imgur user profile
    };

    var newImgurSign = new ImgurSign(signProps);

    return newImgurSign;
  }

  function buildLinkUrl(username) {
    return 'http://imgur.com/user/' + username;
  }

  signBuilder.imgur = buildImgurSign;
};
