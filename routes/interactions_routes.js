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
        if(err) {
          console.log('Error finding user id by username in interactions/log/userpagevisit. Error: ', err);
          return res.send();
        }

        console.log("USER FOUND IN INTERACTIONS ROUTE IS: ", user);
        new Interaction({
          guid:             guid,
          targetCategory:   'userpageview',
          targetIdentifier: user._id,  // should always be the UserID or SignID
          interactorUserId: interactorUserId,
        }).save();
        console.log("DONE SAVING USER INTERACTION!!!");
      });
      return res.send(); // immediately respond!
    }
    else {
      console.log('Missing required user page interaction value(s)');
      return res.send();
    }
  });

  router.get('/interactions/log/signlinkoff', function(req, res) {

    console.log("MADE IT TO SIGNCLICK");
    var guid             = req.query.guid;
    var signId           = req.query.signid;
    var signIcon         = req.query.signicon;
    var interactorUserId = (notNullish([req.query.userid]) ? req.query.userid : null);

    if( notNullish([guid, signId, signIcon]) ) {
      new Interaction({
        guid:             guid,
        targetCategory:  'signlinkoff',
        targetIdentifier: signId,  // This should be a mongoose type, but which REF?!!!
        targetType:       signIcon,
        interactorUserId: interactorUserId,
      }).save();  // immediately save!

      console.log("DONE SAVING SIGN INTERACTION!!!");
      return res.send();  // respond immediately!
    }
    else {
      console.log('Missing required sign linkoff interaction value(s)');
      return res.send();  // respond immediately!
    }
  });

  function notNullish(valuesArray) {
    return valuesArray.every(function(value) {
      return value && value !== 'null';
    });
  }
}
