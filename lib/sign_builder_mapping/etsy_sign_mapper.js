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
      knownAs:        (getProfileName(etsyData) || etsyData.knownAs),  // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        (buildLinkUrl(getProfileName(etsyData))  || etsyData.linkUrl),  // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      profileId:      getProfileId(etsyData),
      picUrl:         getPicUrl(etsyData),
    };

    var newEtsySign = new EtsySign(signProps);

    return newEtsySign;
  }

  function getProfileName(etsy) {
    try { return etsy.profile.name; }
    catch (e) {
      console.log('Data access error for Etsy name: ', e);
      return '';
    }
  }

  function getProfileId(etsy) {
    try { return etsy.profile.id; }
    catch (e) {
      console.log('Data access error for Etsy id: ', e);
      return '';
    }
  }

  function getPicUrl(etsy) {
    try { return etsy.results[0]['image_url_75x75']; }
    catch (e) {
      console.log('Data access error for Etsy picUrl: ', e);
      return '';
    }
  }

  function buildLinkUrl(username) {
    return 'https://' + username + '.etsy.com/';
  }

  signBuilder.etsy = buildEtsySign;
};
