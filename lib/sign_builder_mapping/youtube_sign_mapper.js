'use strict';

var YoutubeSign = require('../../models/YoutubeSign.js');

module.exports = function(signBuilder) {

  function buildYoutubeSign(ytbData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: bgColor, circledByCount, profileId, picUrl, icon, signType
    console.log("YOUTUBE DATA RECEIVED IS: ", ytbData);
    var signProps = {
      // ----------------- BASE -----------------------
      // description:    ytbData.description,                // optional for updates?
      knownAs:        ( ytbData.displayName      || ytbData.knownAs ),      // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        ( buildLinkUrl(ytbData.id) || ytbData.linkUrl ),      // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      profileId:      ytbData.id,
      picUrl:         getPicUrl(ytbData),
    };

    var newYoutubeSign = new YoutubeSign(signProps);

    return newYoutubeSign;
  }

  signBuilder.youtube = buildYoutubeSign;
};

function buildLinkUrl(youtubeID) {
  return 'http://www.youtube.com/channel/' + youtubeID;
}

function getPicUrl(youtubeProfile) {
  var url;
  var thumbs = youtubeProfile &&
               youtubeProfile._json.items &&
               youtubeProfile._json.items[0] &&
               youtubeProfile._json.items[0].snippet &&
               youtubeProfile._json.items[0].snippet.thumbnails;

  if(thumbs) {
    var pic = thumbs.high ||     // Use this first
              thumbs.medium ||   // Else this
              thumbs.default;    // Finally this
    url = pic.url;
  }
  var isUrlString = (url instanceof String) || (typeof(url) == 'string');
  console.log("Youtube URL is: ", url);

  return ( isUrlString ? url : '');
};
