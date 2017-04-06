'use strict';

/*
  This module bypasses the need for additional API data
  Profile is adequate, and returns profile data through for sign creation use
*/

// NEED TO UPDATE THIS FUNCTION FOR ALL SIGNS THAT BYPASS
module.exports = function bypassApi(accessToken, profile, callback) {

  // Already have needed data from Profile, so just send to callback
  if(!profile && !profile._json) {
    console.log('Error: No profile info received.');
    return callback('No profile info available.', null);
  }

  var apiProfile = profile._json || profile; // Capture _json case (usually more data), or default to basic case
  apiProfile.apiWasCalled = true;            // FAKE flag, since don't need full API call if using bypass

  return callback(null, apiProfile);
};
