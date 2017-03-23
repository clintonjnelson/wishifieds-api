'use strict';

// This middleware simply moves the EAT token to be consistently at eat.req
// for all other middlewares that may need the EAT

module.exports = function(req, res, next) {
  // Look for token on Cookies header
  console.log("EAT_ON_REQ - HERE IS HEADERS THAT MAY HAVE TOKEN: ", req.headers);
  console.log("EAT_ON_REQ - PARAMS ARE: ", req.params);
  console.log("EAT_ON_REQ - QUERY IS: ", req.query);

  var cookie        = req.headers && req.headers.cookie;
  var cookieTokens  = cookie ? parseEatCookie(cookie) : {};

  // Grab token off of any likely location
  var eatToken = req.headers.eat ||   // Often here
                 req.body.eat ||      // Often here
                 req.params.eat ||    // Possibly here, but not usually
                 req.query.eat ||     // This is for Oauth initial request
                 req.query.state ||   // This is for Oauth response from Provider
                 cookieTokens.eat;    // generally don't put it here

  // Put EAT on the req & continue. Do not fail.
  console.log("EAT_ON_REQ: PUTTING FOUND EAT ON THE REQ:", eatToken);
  req.eat = eatToken;
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
}
