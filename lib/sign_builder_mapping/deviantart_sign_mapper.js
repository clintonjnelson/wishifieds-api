'use strict';

var DeviantartSign = require('../../models/DeviantartSign.js');

module.exports = function(signBuilder) {

  function buildDeviantartSign(dvtData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: bgColor, followers, deviantartId, picUrl, icon, signType
    // NOTE: most not needed OR covered by defaults

    var signProps = {
      // ----------------- BASE -----------------------
      // description:    dvtData.description,                      // optional for updates?
      knownAs:        (dvtData.username || dvtData.knownAs),  // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        ( buildLinkUrl(dvtData.username) || dvtData.linkUrl ),  // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      profileId:      dvtData.id,
      picUrl:         dvtData._json.usericon,
    };

    var newDeviantartSign = new DeviantartSign(signProps);

    return newDeviantartSign;
  }

  function buildLinkUrl(username) {
    return 'http://' + username + '.deviantart.com/';
  }

  signBuilder.deviantart = buildDeviantartSign;
};
