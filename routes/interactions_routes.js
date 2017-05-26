'use strict';

var bodyparser  = require('body-parser');
var Interaction = require('../models/Interaction.js');
var User        = require('../models/User.js');

module.exports = function(router) {
  router.use(bodyparser.json());

  // How to ONLY accept requests from client app? Can we check the caller?
  router.get('/interactions/log/userpagevisit', function(req, res) {

    // Now do the work with data received
    console.log("MADE IT TO USER PAGE CLICK");
    var guid             = req.query.guid;
    var username         = req.query.pageusername;
    var interactorUserId = (notNullish([req.query.userid]) ? req.query.userid : null);

    if( notNullish([guid, username]) ) {
      User.findOne({username: username}, function(err, user){
        if(err) { return console.log('Error finding user id by username in interactions/userpagevisit. Error: ', err); }

        console.log("USER FOUND IN INTERACTIONS ROUTE IS: ", user);
        new Interaction({
          guid:             guid,
          targetType:       'userpageview',
          targetIdentifier: user._id,  // should always be the UserID or SignID
          interactorUserId: interactorUserId,
        }).save();
        console.log("DONE SAVING USER INTERACTION!!!");
      });
      res.send(); // immediately respond!
    }
    else {
      console.log('Missing required user page interaction value(s)');
    }
  });

  router.get('/interactions/log/signlinkoff', function(req, res) {

    console.log("MADE IT TO SIGNCLICK");
    var guid             = req.query.guid;
    var signId           = req.query.signid;
    var interactorUserId = (notNullish([req.query.userid]) ? req.query.userid : null);

    if( notNullish([guid, signId]) ) {
      new Interaction({
        guid:             guid,
        targetType:       'signlinkoff',
        targetIdentifier: signId,  // This should be a mongoose type, but which REF?!!!
        interactorUserId: interactorUserId,
      }).save();  // immediately save!

      console.log("DONE SAVING SIGN INTERACTION!!!");
      res.send();  // respond immediately!
    }
    else {
      console.log('Missing required sign linkoff interaction value(s)');
    }
  });

  function notNullish(valuesArray) {
    return valuesArray.every(function(value) {
      return value && value !== 'null';
    });
  }
}
