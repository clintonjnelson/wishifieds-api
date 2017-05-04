'use strict';

var PinterestSign = require('../../models/PinterestSign.js');

module.exports = function(signBuilder) {

  function buildPinterestSign(ptData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: bgColor, circledByCount, profileId, picUrl, icon, signType
    console.log("PINTEREST DATA RECEIVED IS: ", ptData);
    var signProps = {
      // ----------------- BASE -----------------------
      // description:    ptData.description,                // optional for updates?
      knownAs:        (ptData.displayName || getNameFromProfile(ptData) || ptData.knownAs),  // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        getLinkUrl(ptData),      // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      followersCount: getFollowersCount(ptData),
      profileId:      getProfileId(ptData),
      picUrl:         getPicUrl(ptData),
    };

    var newPinterestSign = new PinterestSign(signProps);

    return newPinterestSign;
  }

  function getNameFromProfile(pt) {
    try { return pt.profile.displayName; }
    catch (e) {
      console.log('Data access error for Pinterest followers: ', e);
      return null;
    }
  }

  function getFollowersCount(pt) {
    try { return pt.data.counts.followers; }
    catch (e) {
      console.log('Data access error for Pinterest followers: ', e);
      return '';
    }
  }

  function getLinkUrl(pt) {
    try { return pt.profile._json.data.url; }
    catch (e) {
      try { return buildLinkUrl(pt.data.username); }
      catch (ee) {
        console.log('Data access error for Pinterest url & username: ', ee);
        return pt.linkUrl || '';
      }
    }
  }

  function buildLinkUrl(username) {
    if(username) {
      return 'https://www.pinterest.com/' + username;
    }
    return null;
  }

  function getProfileId(pt) {
    try { return pt.data.id; }
    catch (e) {
      console.log('Data access error for Pinterest Id: ', e);
      return '';
    }
  }

  function getPicUrl(pt) {
    try { return pt.data.image['60x60'].url; }
    catch (e) {
      console.log('Data access error for Pinterest picUrl: ', e);
      return '';
    }
  }

  signBuilder.pinterest = buildPinterestSign;
};
