'use strict';

// This checks that the request is https & redirects to https if not

module.exports = function(req, res, next) {
  if (!req.secure &&
    req.get("x-forwarded-proto") !== "https" &&
    process.env.NODE_ENV === "production") {
    res.redirect(301, 'https://'+ req.host + req.url);
  }
  else {
    next();
  }
}
