'use strict';

/*
 * These routes are technically "GET" routes, but they are used to log tracking
 * data to the system. Things like clicks & visits to pages.
 * These are currently set to only allow one instance per user per day (so, if a
 * visitor visits 5x in one day, it will only show it as 1 visit on that day since
 * it was the same visitor - denoted by the tracking guid. If the same visitor
 * visits on the next day, another "visit" would be tracked for that day. Same for
 * clicks.) This is done by ensurin uniqueness on guid/eventDate combo.
 *
 */


var bodyparser  = require('body-parser');
var Interaction = require('../models/Interaction.js');
var User        = require('../models/User.js');

module.exports = function(router) {
  router.use(bodyparser.json());

  // How to ONLY accept requests from client app? Can we check the caller?
  router.get('/interactions/log/userpagevisit', function(req, res) {

    // Make this as fail-proof as possible. Should never fail the server.
    try {
      // Now do the work with data received
      console.log("MADE IT TO USER PAGE CLICK");
      var guid             = req.query.guid;
      var pagename         = req.query.pageusername;
      var interactorUserId = (notNullish([req.query.userid]) ? req.query.userid : null);
      console.log("USERNAME IN REQUEST IS: ", pagename);
      if( notNullish([guid, pagename]) ) {
        // try to get user by pagename (if pagename is a username)
        User.findOne({username: pagename}, function(err, user){
          if(err) {
            console.log('Error finding user id by username in interactions/log/userpagevisit. Error: ', err);
            return res.send();
          }

          console.log("USER FOUND IN INTERACTIONS ROUTE IS: ", user);
          // set the identifier => userID or pagename
          var identifier = (user && user._id ? user._id : pagename);
          var eventDate  = new Date(Date.now()).toISOString().split("T")[0];

          new Interaction({
              guid:             guid,
              targetCategory:   'userpageview',
              targetIdentifier: identifier,  // should always be the UserID or SignID
              interactorUserId: interactorUserId,
              eventDate:        eventDate
            }).save();
            console.log("DONE SAVING USER INTERACTION!!!");
        });
        return res.send(); // immediately respond!
      }
      else {
        console.log('Missing required user page interaction value(s)');
        return res.send();
      }
    } catch (e) {
      console.log('Caught error in pageview interaction. Error: ', e);
      return res.send();
    }

    // Could remove ALL res.send() and do a "finally" statement instead, but this seems more explicit
  });

  router.get('/interactions/log/signlinkoff', function(req, res) {

    // Make this as fail-proof as possible. Should never fail the server.
    try {
      console.log("MADE IT TO SIGNCLICK");
      var guid             = req.query.guid;
      var signId           = req.query.signid;
      var signIcon         = req.query.signicon;
      var interactorUserId = (notNullish([req.query.userid]) ? req.query.userid : null);
      var eventDate        = new Date(Date.now()).toISOString().split("T")[0];

      if( notNullish([guid, signId, signIcon]) ) {
        new Interaction({
          guid:             guid,
          targetCategory:  'signlinkoff',
          targetIdentifier: signId,  // This should be a mongoose type, but which REF?!!!
          targetType:       signIcon,
          interactorUserId: interactorUserId,
          eventDate:        eventDate,
        }).save();  // immediately save!

        console.log("DONE SAVING SIGN INTERACTION!!!");
        return res.send();  // respond immediately!
      }
      else {
        console.log('Missing required sign linkoff interaction value(s)');
        return res.send();  // respond immediately!
      }
    }
    catch (e) {
      console.log('Caught error in signlinkoff interaction. Error: ', e);
      return res.send();
    }
  });

  function notNullish(valuesArray) {
    return valuesArray.every(function(value) {
      return value && value !== 'null';
    });
  }
}
