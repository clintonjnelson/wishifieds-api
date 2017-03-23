'use strict';

var bodyparser = require('body-parser');
var eatAuth    = require('../lib/routes_middleware/eat_auth.js')(process.env.AUTH_SECRET);
var eatOnReq   = require('../lib/routes_middleware/eat_on_req.js');

module.exports = function(router, passport) {
  router.use(bodyparser.json());

  // Send User Info IF logged in
  router.get('/login/user', eatOnReq, eatAuth, function(req, res) {
    res.json({user: req.user});
  });

  // Existing user login
  router.get('/login', passport.authenticate('basic', { session: false }), function(req, res) {
    req.user.generateToken(process.env.AUTH_SECRET, function(err, eat) {  // passport strat adds req.user
      if (err) {
        console.log('Error logging in user. Error: ', err);
        return res.status(500).json({ error: true });
      }
      res.json({
        eat:      eat,
        username: req.user.username,
        userId:   req.user._id,
        email:    req.user.email,
        role:     req.user.role
      });
    });
  });

  // User signout
  router.get('/logout', eatOnReq, eatAuth, function(req, res) {
    req.user.invalidateToken(function(err, result) {
      if (err) { return res.status(500).json({ error: true }); }

      res.json({ success: true });
    });
  });
};
