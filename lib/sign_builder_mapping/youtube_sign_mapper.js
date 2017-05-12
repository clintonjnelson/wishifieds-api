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
      knownAs:        ( getAndScrubDisplayName(ytbData) || ytbData.knownAs ),      // TODO: VERIFY || is NOT BACKWARDS!
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

function getAndScrubDisplayName(ytb) {
  try       { return ytb.displayName.split('@')[0]; }  // works with username or if email, takes only first part
  catch (e) {
    console.log('Data access error; could not parse Youtube displayName: ', e);
    return ytb.displayName;
  }
}

function getPicUrl(ytb) {
  var url;
  var thumbs;
  try       { thumbs = ytb._json.items[0].snippet.thumbnails; }
  catch (e) { console.log('Data access error for Youtube picUrl thumb: ', e); }

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
