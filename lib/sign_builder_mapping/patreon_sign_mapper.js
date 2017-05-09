'use strict';

var PatreonSign = require('../../models/PatreonSign.js');

module.exports = function(signBuilder) {

  function buildPatreonSign(ptnData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: bgColor, followers, patreonId, picUrl, icon, signType
    // NOTE: most not needed OR covered by defaults

    console.log("PATREON MAPPING DATA AVAILABLE IS: ", ptnData);

    var signProps = {
      // ----------------- BASE -----------------------
      // description:    ptnData.description,                      // optional for updates?
      knownAs:        (getKnownAs(ptnData) || ptnData.knownAs),  // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        (getLinkUrl(ptnData) || ptnData.linkUrl),  // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      profileId:      ptnData.id,
      picUrl:         getPicUrl(ptnData),  // No pic for Patreon user profile
    };

    var newPatreonSign = new PatreonSign(signProps);

    return newPatreonSign;
  }

  function getKnownAs(ptn) {
    try      { return ptn._json.attributes.vanity; } // 100px thumb vs 400px avatar
    catch(e) {
      console.log('Could not get data for Patreon vanity name. Error: ', e);
      return '';
    }
  }

  function getLinkUrl(ptn) {
    try      { return ptn._json.attributes.url; } // 100px thumb vs 400px avatar
    catch(e) {
      console.log('Could not get data for Patreon url. Error: ', e);
      return '';
    }
  }

  function getPicUrl(ptn) {
    try      { return ptn._json.attributes.thumb_url; } // 100px thumb vs 400px avatar
    catch(e) {
      console.log('Could not get data for Patreon pic url. Error: ', e);
      return '';
    }
  }

  signBuilder.patreon = buildPatreonSign;
};
