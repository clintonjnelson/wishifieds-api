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
      linkUrl:        (buildLinkUrl(dvtData.username) || dvtData.linkUrl ),  // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      profileId:      dvtData.id,
      picUrl:         getPicUrl(dvtData),
    };

    var newDeviantartSign = new DeviantartSign(signProps);

    return newDeviantartSign;
  }

  function getPicUrl(dvt) {
    try { return dvt._json.usericon; }
    catch (e) {
      console.log('Data access error for Deviantart picUrl: ', e);
      return '';
    }
  }

  function buildLinkUrl(username) {
    return 'http://' + username + '.deviantart.com/';
  }

  signBuilder.deviantart = buildDeviantartSign;
};
