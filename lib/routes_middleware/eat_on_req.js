'use strict';

// This middleware simply moves the EAT token to be consistently at eat.req
//   for all other middlewares that may need the EAT

///////////// UNIT TEST THIS FUNCTION!!!!! ///////////////

module.exports = function(req, res, next) {
  // Look for token on Cookies header
  console.log("EAT_ON_REQ - HERE IS HEADERS THAT MAY HAVE TOKEN: ", req.headers);
  console.log("EAT_ON_REQ - PARAMS ARE: ", req.params);
  console.log("EAT_ON_REQ - QUERY IS: ", req.query);

  var cookie        = req.headers && req.headers.cookie;
  var cookieTokens  = cookie ? parseEatCookie(cookie) : {};
  console.log("EAT_ON_REQ - COOKIES ARE: ", cookieTokens);

  // Grab token off of any likely location
  var eatToken = req.headers.eat ||   // Often here
                 req.body.eat ||      // Often here
                 req.params.eat ||    // Possibly here, but not usually
                 req.query.eat ||     // This is for Oauth initial request
                 req.query.state ||   // This is for Oauth response from Provider
                 cookieTokens.oauth1eat || // Only useful for Oauth1
                 cookieTokens.eat;    // generally don't put it here

  // Put EAT on the req & continue. Do not fail.
  console.log("EAT_ON_REQ: PUTTING FOUND EAT ON THE REQ:", eatToken);
  // if(!eatToken) { return res.redirect(401, '/').json({ reset: true, error: 'please sign in' }); }

  var uriEncodedEat = maintainURIEncoding(eatToken);
  req.eat = uriEncodedEat;
  next();

  function parseEatCookie(cookie) {
    var tokensArr = cookie.split('; ');
    var cookieTokens = {};

    for(var i=0, subArr, k, v; i<tokensArr.length; i++) {
      subArr = tokensArr[i].split('=');
      k      = subArr[0];
      v      = subArr[1];
      cookieTokens[k] = v;
    }
    return cookieTokens;
  }

  // This is necessary, because sometimes EAT gets sent off again on OAuth request
  // before coming back for decoding & comparison. Lack of encoding causes string to change.
  function maintainURIEncoding(eat) {
    if(!eat) { return eat; }

    var uriDecodedEat = decodeURIComponent(eat);
    var decodedCountMax = 20;
    var decodedCount = 0;
    while(uriDecodedEat !== eat && decodedCount < decodedCountMax) {
      uriDecodedEat = decodeURIComponent(uriDecodedEat);
      decodedCount++;
    }
    var spaceToPlusSubbedEat = uriDecodedEat.replace(/ /g, '+'); // Some cases plus is lost to space - likely case insensitive uri decoding
    console.log("AFTER LOOPING & PLUS REPLACEMENT, STRING IS: ", spaceToPlusSubbedEat);
    // Get it back to baseline, then encode it ONCE
    return encodeURIComponent(spaceToPlusSubbedEat);
  }
}
