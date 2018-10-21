'use strict';

var bodyparser = require('body-parser');
var eatOnReq = require('../lib/routes_middleware/eat_on_req.js');
var eatAuth = require('../lib/routes_middleware/eat_auth.js')(process.env.AUTH_SECRET);
var ownerAuth = require('../lib/routes_middleware/owner_auth.js');
var Listing = require('../db/models/index.js').Listing;
var Message = require('../db/models/index.js').Message;
var User = require('../db/models/index.js').User;



module.exports = function(router) {
  router.use(bodyparser.json());


  /*
    The GET messages by listing route needs to be able to return a flexible structure:
      - Should get only messages for the requested listing
      - If requested by NOT the owner, should verify there are messages by the requestor
      VERIFY -- RETUESTOR's messages should be top-level
      - Other messages should be nested below:
          -- For Non-Owner Requestor, nesting should be ONE level - the OWNEr
          -- for Owner Requestor, nesting should have ALL of the other user's messages below, separated by userId.

    -- Should the message response attach user info to the messages also?
        Or make UI request user info for each user?
        User info should include profile pic url. Probably ok to include.
        Maybe could make a route to get multiple profile pics by a list of UserID's
  */

  router.post('/messages', eatOnReq, eatAuth, function(req, res) {
    console.log("In messages post. Body is: ", req.body);


    const messageData = req.body.message;
    const sender = req.user;
    console.log("Message data is: ", messageData);
    console.log("User is: ", sender);


    if(!sender) {
      return res.status(401).json({error: true, msg: "Messages can only be sent by users."});
    }
    if(!passesMessageValidations(messageData, sender)) {
      return res.status(400).json({error: true, msg: "Message failed validations."});
    }

    // TODO: Validate the inputs
    // Sender on UI should equal sender on API!
    // Message should have content
    // construct the format for saving
    const preMessage = {
      sender_id:     sender.id,
      recipient_id:  messageData.recipientId,
      listing_id:    messageData.listingId,
      content:       messageData.content
    };

    Message
      .create(preMessage)
      .then( message => {
        console.log("NEWLY CREATED MESSAGE IS: ", message);

        res.json({error: false, success: true, message: message});
      })
      .catch(function(error) {
        console.log("Error creating message: ", error);
        return res.status(400).json({error: true, msg: 'Could not create message.'});
      });
  });
}


function passesMessageValidations(messageData, sender) {
  const checks = sender &&
  messageData &&
  sender.id &&
  messageData.senderId &&
  (sender.id.toString() !== messageData.senderId.toString()) &&
  true;  // returns the last value

  console.log("VALIDATION CHECKS IS: ", checks);
  return !!checks;  // BangBang, just to be safe
}
