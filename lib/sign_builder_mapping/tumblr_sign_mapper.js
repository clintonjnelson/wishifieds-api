'use strict';

var TumblrSign   = require('../../models/TumblrSign.js');

module.exports = function(signBuilder) {

  function buildTumblrSign(tbrData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: picUrl, profileId
    console.log("TUMBLR DATA RECEIVED IN PROFILE IS: ", tbrData);
    var signProps = {
      // ----------------- BASE -----------------------
      description:    tbrData.description,                  // optional for updates?
      knownAs:        (tbrData.username || tbrData.knownAs),  // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        (tbrData.url || tbrData.linkUrl ),      // CHANGE IF DO MULTISIGN (or load each url elsewhere)
      // ----------------- CUSTOM ---------------------
      profileId:      tbrData.id,
      picUrl:         buildPicUrl(tbrData.username),
      following:      tbrData.following,
    };

    // Load schema data into new tumblr sign
    var newTumblrSign = new TumblrSign(signProps);


    return newTumblrSign;
  }

  function buildPicUrl(username) {
    return 'https://api.tumblr.com/v2/blog/' + username + '.tumblr.com/avatar';
  }

  signBuilder.tumblr = buildTumblrSign;
};
