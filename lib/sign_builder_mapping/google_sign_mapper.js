'use strict';

var GoogleSign = require('../../models/GoogleSign.js');

module.exports = function(signBuilder) {

  function buildGoogleSign(gglData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: bgColor, circledByCount, profileId, picUrl, icon, signType
    console.log("GOOGLE DATA RECEIVED IS: ", gglData);
    var signProps = {
      // ----------------- BASE -----------------------
      // description:    gglData.description,                // optional for updates?
      knownAs:        (gglData.displayName  || gglData.knownAs),      // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        (getLinkUrl(gglData)    || gglData.linkUrl),      // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      circledByCount: getCircledByCount(gglData),
      profileId:      gglData.id,
      picUrl:         getPicUrl(gglData),
    };

    var newGoogleSign = new GoogleSign(signProps);

    return newGoogleSign;
  }

  function getLinkUrl(ggl) {
    try { return ggl._json.url; }
    catch (e) {
      console.log('Data access error for google linkUrl: ', e);
      return '';
    }
  }
  function getCircledByCount(ggl) {
    try { return ggl._json.response.profileUrl; }
    catch (e) {
      console.log('Data access error for google circledBy: ', e);
      return '';
    }
  }
  function getPicUrl(ggl) {
    try { return ggl._json.response.profileUrl; }
    catch (e) {
      console.log('Data access error for google picUrl: ', e);
      return '';
    }
  }

  signBuilder.google = buildGoogleSign;
};
