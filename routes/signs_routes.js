'use strict';

var bodyparser    = require('body-parser'              );
var eatAuth       = require('../lib/routes_middleware/eat_auth.js')(process.env.AUTH_SECRET);
var signOwnerAuth = require('../lib/routes_middleware/sign_owner_auth.js');
var FacebookSign  = require('../models/FacebookSign.js');
var mongoose      = require('mongoose'                 );
var Sign          = require('../models/Sign.js'        );
var signBuilder   = require('../lib/sign_builder.js'   );
var User          = require('../models/User.js'        );

module.exports = function(app) {
  app.use(bodyparser.json());


  // Get by username OR userId
  app.get('/signs/:usernameOrId', function(req, res) {

    // set query for username OR id
    var paramVal = req.params.usernameOrId;
    var queryObj = mongoose.Types.ObjectId.isValid(paramVal) ?
      {_id:      paramVal} :
      {username: paramVal};

    User.findOne(queryObj, function(err, user) {
      if(err) {
        console.log('Database error getting user by username or id:', err);
        return res.status(500).json({error: true, msg: 'database error'});
      }
      if(!user) {
        console.log('User could not be found. User is: ', user);
        return res.status(204).json({msg: 'user not found', signs: []});
      }
      console.log("USER FOUND IS: ", user);

      // user found => get signs
      Sign.find({userId: user._id}, function(err, signs) {
        if(err) {
          console.log("Error getting signs: ", err);
          return res.status(500).json({error: true, msg: 'Database error.'});
        }

        // filter to show only Active (A)
      var filteredSigns = signs.filter(function(sign) {
        console.log("CHECKING SIGN FOR FILTERING. SIGN IS: ", sign);
        return sign.status === 'A';
      });
      console.log("FINAL FILTERED SIGNS IS: ", filteredSigns);
      res.json({signs: filteredSigns, username: user.username});
      });
    });
  });

  // Get users OWN signs (restricted route)
  app.get('/signs', eatAuth, function(req, res) {

    Sign.find({userId: req.user._id}, function(err, signs) {
      if(err) {
        console.log("Error getting signs: ", err);
        return res.status(500).json({error: true, msg: 'Database error.'});
      }

      console.log("SIGNS FOUND: ", signs);

      // filter to show only Active (A)
      var filteredSigns = signs.filter(function(sign) {
        console.log("CHECKING SIGN FOR FILTERING. SIGN IS: ", sign);
        return sign.status === 'A';
      });
      console.log("FINAL FILTERED SIGNS IS: ", filteredSigns);
      res.json({signs: filteredSigns});
    });
  });


  // eatAuth: Creation should be made only by the user - verify. Use token.
  // Should verify url param :type. Default is custom. Custom can be anything.
      // custom avoids asking for info directly
  // If request for known :type param (user wants autoload), use that proceedure via oauth or API.
      // Procedure should be loaded via sign-creation-library supported by modules
  app.post('/signs', eatAuth, function(req, res) {
    console.log('CREATING SIGN....');
    console.log('DATA IS: ', req.body);

    var currUser    = req.user;
    var signData    = req.body.sign;
    signData.userId = currUser._id;
    delete signData._id;

    var type = signData.signType || 'custom';         // passed param or custom
    // catch wrong types
    if( !signBuilder[type] ) {
      console.log('Type ' + type + ' is not a valid build type.');
      return res.status(400).json({error: true, msg: 'type does not exist'});
    }

    // Mapping: build sign according to "type" (see above)
    var newSign    = signBuilder[type](signData);
    newSign.userId = currUser.id;           // add userId before saving
    console.log("ABOUT TO SAVE SIGN...", newSign);

    newSign.save(function(err, data) {
      if(err) {
        console.log("Could not save sign. Error: ", err);
        return res.status(500).json({error: true, msg: 'could not save sign'});
      }

      // CLEAN THIS UP, PROBABLY ALWAYS NEED TO RETURN OWNER & PICURL IN SCHEMA
      var returnSign = Object.assign({}, data);
      returnSign._doc.username = currUser.username;  // REMOVE
      returnSign._doc.owner    = currUser.username;  // REMOVE
      returnSign._doc.picUrl   = '';
      console.log("NEW SIGN TO RETURN IS: ", returnSign._doc);
      return res.json({sign: returnSign._doc});
    });
  });

  // Update after verifying user & owner
  app.patch('/signs', eatAuth, signOwnerAuth, function(req, res) {
    console.log('MADE IT TO THE SERVER UPDATE.');
    console.log('USER IS: ', req.user);
    console.log('DATA IS: ', req.body);

    var currUser = req.user;
    var signData = req.body.sign;

    Sign.update({_id: signData._id}, signData, function(err, data) {
      if(err) {
        console.log('Database error finding sign to update.');
        return res.status(500).json({error: true, msg: 'database error'});
      }

      console.log('UPDATE SUCCESSFUL!');
      res.json({error: false});
    });
  });

  // Delete Sign
  app.delete('/signs', eatAuth, signOwnerAuth, function(req, res) {
    console.log('Made it to the server DELETE');
    console.log('USER IS: ', req.user);
    console.log('REQUEST BODY IS: ', req.body);

    var currUser  = req.user;
    var delSignId = req.body.sign._id;

    // UPDATE THE STATUS, NOT THE PUBLISHED VALUE. Status should be D.
    Sign.update({_id: delSignId}, {$set: {status: 'D'}}, function(err, data) {
      if(err) {
        console.log('Database error deleting sign.');
        return res.status(500).json({error: true, msg: 'database error'});
      }

      console.log("DELETION SUCCESSFUL. Data returned is: ", data);
      res.json(true);
    });
  });
};

