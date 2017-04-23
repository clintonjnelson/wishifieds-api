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
      linkUrl:        (fsqData._json.response.user.canonicalUrl || fsqData.linkUrl),  // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      friendsCount:   fsqData._json.response.user.friends.count,
      profileId:      fsqData.id,
      picUrl:         buildPicUrl(fsqData._json.response.user.photo),
    };

    var newFoursquareSign = new FoursquareSign(signProps);

    return newFoursquareSign;
  }

  function buildPicUrl(photoObj) {
    var size = '60x60'
    return photoObj.prefix + size + photoObj.suffix;
  }

  signBuilder.foursquare = buildFoursquareSign;
};
