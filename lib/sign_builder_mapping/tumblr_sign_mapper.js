'use strict';

var TumblrSign   = require('../../models/TumblrSign.js');

module.exports = function(signBuilder) {

  function buildTumblrSign(tbrData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: picUrl, profileId
    console.log("TUMBLR DATA RECEIVED IN PROFILE IS: ", tbrData);
    // var signProps = {
    //   // ----------------- BASE -----------------------
    //   description:    tbrData.title,                  // optional for updates?
    //   knownAs:        (tbrData.username || tbrData.knownAs),  // TODO: VERIFY || is NOT BACKWARDS!
    //   linkUrl:        (tbrData.url || tbrData.linkUrl ),      // CHANGE IF DO MULTISIGN (or load each url elsewhere)
    //   // ----------------- CUSTOM ---------------------
    //   profileId:      tbrData.id,
    //   siteId:         tbrData.name,
    //   picUrl:         buildPicUrl(tbrData.name),
    //   followers:      tbrData.following,
    // };

/////////// NOOOOOOOOO - WE DO MAPPING 2x!!!!! DO THIS ONLY ONE TIME PER SIGN/////////////
/////////// MOVE LOGIC FROM API RESPONSE HANDLER ALL HERE. DO 1x. ///////////////

    var signProps = {
      // ----------------- BASE -----------------------
      description:    tbrData.description,                  // optional for updates?
      knownAs:        tbrData.knownAs,  // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        tbrData.linkUrl,      // CHANGE IF DO MULTISIGN (or load each url elsewhere)
      // ----------------- CUSTOM ---------------------
      profileId:      tbrData.profileId,
      siteId:         tbrData.siteId,
      picUrl:         tbrData.picUrl,
      followers:      tbrData.followers,
    };

    // Load schema data into new tumblr sign
    var newTumblrSign = new TumblrSign(signProps);


    return newTumblrSign;
  }

  signBuilder.tumblr = buildTumblrSign;
};
