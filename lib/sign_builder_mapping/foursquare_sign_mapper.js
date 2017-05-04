'use strict';

var FoursquareSign = require('../../models/FoursquareSign.js');

module.exports = function(signBuilder) {

  function buildFoursquareSign(fsqData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: bgColor, followers, foursquareId, picUrl, icon, signType
    // NOTE: most not needed OR covered by defaults

    var signProps = {
      // ----------------- BASE -----------------------
      // description:    fsqData.description,                      // optional for updates?
      knownAs:        (fsqData.username   || fsqData.knownAs),  // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        (getLinkUrl(fsqData) || fsqData.linkUrl),  // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      friendsCount:   getFriendsCount(fsqData),
      profileId:      fsqData.id,
      picUrl:         buildPicUrl(getPicUrlBase(fsqData)),
    };

    var newFoursquareSign = new FoursquareSign(signProps);

    return newFoursquareSign;
  }

  function getLinkUrl(fsq) {
    try { return fsq._json.response.user.canonicalUrl; }
    catch (e) {
      console.log('Data access error for foursquare linkUrl: ', e);
      return '';
    }
  }

  function getFriendsCount(fsq) {
    try { return fsq._json.response.user.friends.count; }
    catch (e) {
      console.log('Data access error for foursquare friendsCount: ', e);
      return '';
    }
  }

  // Returns the Foursquare photo object
  function getPicUrlBase(fsq) {
    try { return fsq._json.response.user.photo; }
    catch (e) {
      console.log('Data access error for foursquare picUrl: ', e);
      return '';
    }
  }

  function buildPicUrl(photoObj) {
    var size = '60x60'
    return photoObj.prefix + size + photoObj.suffix;
  }

  signBuilder.foursquare = buildFoursquareSign;
};
