'use strict';

var bodyparser = require('body-parser');
var eatAuth    = require('../lib/routes_middleware/eat_auth.js')(process.env.AUTH_SECRET);
var eatOnReq   = require('../lib/routes_middleware/eat_on_req.js');

module.exports = function(router, passport) {
  router.use(bodyparser.json());

  // Send User Info IF logged in
  router.get('/login/user', eatOnReq, eatAuth, function(req, res) {
    res.json({
      eat:      req.eat,
      username: user.username,
      userId:   user._id,
      email:    user.email,
      role:     user.role
    });
  });

  // Existing user login
  router.get('/login', function(req, res, next) {
    console.log("IN LOGIN...")
    //passport.authenticate('basic', { session: false })
    passport.authenticate('basic', function(error, user, info) {
      console.log("AUTHENTICATING WITH BASIC...")
      if(error) {
        console.log('Error in basic auth. Error: ', error);
        return res.status(400).json({ error: true, msg: error});
      }
      if(!user) {
        console.log('Error in getting user. User is: ', user);
        return res.status(404).json({ error: true, msg: 'user not found'});
      }

      user.generateToken(process.env.AUTH_SECRET, function(err, eat) {  // passport strat adds req.user
        if (err) {
          console.log('Error logging in user. Error: ', err);
          return res.status(404).json({ error: true, msg: 'user not found' });
        }
        res.json({
          eat:      eat,
          username: user.username,
          userId:   user._id,
          email:    user.email,
          role:     user.role
        });
      });
    })(req, res, next);
  });

  // User signout
  router.get('/logout', eatOnReq, eatAuth, function(req, res) {
    req.user.invalidateToken(function(err, result) {
      if (err) { return res.status(500).json({ error: true }); }

      res.json({ success: true });
    });
  });
};
