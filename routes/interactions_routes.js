'use strict';

var bodyparser = require('body-parser');
var Interaction = require('../models/Interaction.js');

module.exports = function(router) {
  router.use(bodyparser.json());

  router.get('/interactions/userpagevisit', function(req, res) {
    console.log("MADE IT TO USER PAGE CLICK");
    var guid             = req.query.guid;
    var username         = req.query.pageusername;
    var interactorUserId = (notNullish([req.query.userid]) ? req.query.userid : null);

    if( notNullish([guid, username]) ) {
      new Interaction({
        guid:             guid,
        targetType:       'userpageview',
        targetIdentifier: username,  // This should be a mongoose type, but which REF?!!!
        interactorUserId: interactorUserId,
      }).save();
      console.log("DONE SAVING USER INTERACTION!!!");
      res.send(); // immediately save!
    }
    else {
      console.log('Missing required user page interaction value(s)');
    }
  });

  router.get('/interactions/signlinkoff', function(req, res) {
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
      res.send();
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
