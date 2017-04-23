'use strict';

var SpotifySign = require('../../models/SpotifySign.js');

module.exports = function(signBuilder) {

  function buildSpotifySign(sfyData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: bgColor, followers, spotifyId, picUrl, icon, signType
    // NOTE: most not needed OR covered by defaults

    var signProps = {
      // ----------------- BASE -----------------------
      // description:    sfyData.description,                      // optional for updates?
      knownAs:        (sfyData.displayName || sfyData.username || sfyData.knownAs),  // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        (sfyData.profileUrl || sfyData.linkUrl),  // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      followersCount: sfyData.followers,
      profileId:      sfyData.id,
      picUrl:         getPicUrl(sfyData.photos),  // TODO: FIX THE PIC URL. MINE DOESN"T HAVE ONE SO CANT SEE IT!!!
    };

    var newSpotifySign = new SpotifySign(signProps);

    return newSpotifySign;
  }

  function getPicUrl(photos) {
    if(photos && photos[0] && photos[0].length > 0 && photos[0].url) {
      return photos[0].url
    }
    // else return null
    return null;
  }

  signBuilder.spotify = buildSpotifySign;
};
