'use strict';

var bodyparser = require('body-parser');
var eatOnReq = require('../lib/routes_middleware/eat_on_req.js');
var eatAuth = require('../lib/routes_middleware/eat_auth.js')(process.env.AUTH_SECRET);
var ownerAuth = require('../lib/routes_middleware/owner_auth.js');
var db = require('../db/models/index.js');
var Listing = db.Listing;
var Message = db.Message;
var User = db.User;
var isEqual = require('../lib/utils.js').isToStringEqual;
var Op = require('sequelize').Op;



module.exports = function(router) {
  router.use(bodyparser.json());

  // GET Messages By Listing (this is in the Listings routes)


   // GET All Messages for requesting user, group by listing (unreads first)
   // TODO: very similar to following endpoint. Maybe consolidate & use flag instead for UNREADs?
     // Note: difference in recipient/sender query as well.
  router.get('/messages', eatOnReq, eatAuth, function(req, res) {
    var userId = req.user.id;
    var username = req.user.username;
    console.log("Getting all messages for user: ", req.user);

    var orderStatement = '"Message"."created_at" ASC'

    Message
      .findAll({
        where: {
          [Op.and]: [
            {[Op.or]: [{recipientId: userId}, {senderId: userId}]},  // ANY listing user has corresponded on
            {[Op.or]: [{status: 'READ'}, {status: 'UNREAD'}]}
          ]
        },
        order: db.Sequelize.literal(orderStatement),
        include: [{
          model: Listing,  // include the listing associated to the message
          include: [{
            model: User  // include the user associated to the listing
          }]
        }],
        raw: true
      })
      .then(function(foundMsgs) {
        console.log("FOUND USERs MESSAGES: ", foundMsgs);
        var msgsByListing = foundMsgs.reduce(getMessagesByListingForUser(username), {});

        var listingsWithMessages = Object.getOwnPropertyNames(msgsByListing)
          .map(listingId => {
            return msgsByListing[listingId];
          });

        res.json({error: false, listingsWithMessages: listingsWithMessages});
      })
      .catch(function(err) {
        console.log('Error listings with messages for user: ', userId, '. Error is: ', err);
        return res.status(500).json({error: true, msg: 'database error'});
      });
  });

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
  // GET profile_pic for a requested user id
  // TODO: Maybe get off of normal user route, but with special flag specifying fields?
  router.get('/messages/unreads', eatOnReq, eatAuth, function(req, res) {
    var userId = req.user.id;
    var username = req.user.username;
    console.log("USER AVAILABLE IS: ", req.user, " WHICH MAY HAVE INFO SO NOT NEED TO JOIN USER??");
    console.log("USER ID: ", userId);
    console.log("USERNAME: ", username);
    var order =  sanitizedOrder(req.query.order);
    var orderStatement = '"Message"."created_at" ' + order;
    console.log("ORDER STATEMENT IS: ", orderStatement);

    Message
      .findAll({
        where: { status: 'UNREAD', recipientId: userId },
        order: db.Sequelize.literal(orderStatement),
        include: [{
          model: Listing,  // Include Listing & Listing's Owner User info
          include: [{
            model: User,
            where: { id: userId }
          }]
        }],
        raw: true
      })
      .then(function(foundMsgs) {
        console.log("UNREAD MESSAGES FOUND FOR USER: ", foundMsgs);
        var msgsByListing = foundMsgs.reduce(getMessagesByListingForUser(username), {});
        // Object fields into Array
        var listingWithMessages = Object.getOwnPropertyNames(msgsByListing)
          .map(listingId => {
            return msgsByListing[listingId];
          });

        res.json({error: false, listingWithMessages: listingWithMessages});
      })
      .catch(function(err) {
        console.log('Error finding messages for user with id: ', userId, '. Error is: ', err);
        return res.status(500).json({error: true, msg: 'database error'});
      });
  });

  // Get Count ALL of a User's Unread Messages (NOT per listing)
  router.get('/messages/totalunread', eatOnReq, eatAuth, function(req, res) {
    const userId = req.user && req.user.id;

    if(!userId) {
      return res.status(401).json({error: true, msg: "Message count only available to users."});
    }

    db.sequelize
      .query(
        'SELECT COUNT(*) ' +
          'FROM "Messages" ' +
            'JOIN "Listings" ON "Messages".listing_id = "Listings".id ' +
            'JOIN "Users" ON "Listings".user_id = "Users".id ' +
          'WHERE "Users".id = $userid ' +
          "AND \"Messages\".status = 'UNREAD';",
        {
          bind: { userid: userId },
          type: db.Sequelize.QueryTypes.SELECT
        })
      .then(function(result) {
        if(result.length && result[0]) {
          console.log("TOTAL UNREAD COUNT: ", result);
          return res.json({error: false, totalUnreads: result[0]['count']});
        }
      })
      .catch(function(error) {
        console.log("Error counting total unread messages: ", error);
        return res.status(500).json({error: true, msg: 'Could not get total unread messages.'});
      });
  });

  // Create new Message
  router.post('/messages', eatOnReq, eatAuth, function(req, res) {
    console.log("In messages post. Body is: ", req.body);


    const messageData = req.body.message;
    const user = req.user;
    console.log("Message data is: ", messageData);
    console.log("User is: ", user);


    if(!user) {
      return res.status(401).json({error: true, msg: "Messages can only be sent by users."});
    }
    if(!passesMessageValidations(messageData, user)) {
      return res.status(400).json({error: true, msg: "Message failed validations."});
    }

    // TODO: Validate the inputs
    // Sender on UI should equal sender on API!
    // Message should have content
    // construct the format for saving
    const preMessage = {
      senderId:     user.id,
      recipientId:  messageData.recipientId,
      listingId:    messageData.listingId,
      content:      messageData.content
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

  // Update Messages Unread => Read
  router.patch('/messages/markread', eatOnReq, eatAuth, function(req, res) {
    console.log("In route to mark UNREAD messages READ: ", req.body);

    const messageIds = req.body.messageIds;
    const user = req.user;

    if(!user) {
      return res.status(401).json({error: true, msg: "Messages can only be set READ by users."});
    }
    if(!messageIds || !messageIds.length) {
      return res.status(400).json({error: true, msg: 'Message ids much be present to mark as READ'});
    }

    // THIS CANNOT BE CHECKED HERE - USE DB TO FILTER BBY USERID TO RECIPIENT ID
    // const allMessagesReceivedByThisUser = messageIds.every(function(msg) {
    //   return isEqual(msg.recipientId, user.id);
    // });
    // if(allMessagesReceivedByThisUser) {
    //   return res.status(401).json({error: true, msg: "You cannot mark READ another recipient's messages."});
    // }


    console.log("ABOUT TO UPDATE FOR IDS: ", messageIds);
    // Convert this to a stored procedure function & call via that!
    db.sequelize
      .query(
        'UPDATE "Messages" SET status=\'READ\' ' +
        "WHERE id = ANY($ids) " +
        "AND recipient_id = $userid;",
        {
          bind: { ids: messageIds, userid: user.id },
          type: db.Sequelize.QueryTypes.UPDATE
        })
      .then(function(results) {
        var totalUpdates = results && results[1];  // returns final eval if true
        // console.log("RESULTS IS: ", results);
        // const totalUpdates = results.reduce(function(total, current) {
        //   return ( isEqual(current.changedRows, '1') ? total++ : total );
        // }, 0);
        const success = ( totalUpdates === messageIds.length );
        console.log("TOTAL UPDATES: ", totalUpdates, " SHOULD EQUAL MESSAGE_IDS LENGTH: ", messageIds.length);

        // May need to return which ones did NOT update, if updated not match
        return res.json({success: success});
      })
      .catch(function(error) {
        console.log("Error setting unread messages to read: ", error);
        return res.status(500).json({error: true, msg: 'Could not set unread messages to read.'});
      });
  });
}


function passesMessageValidations(messageData, sender) {
  try{
    const checks = sender &&
    messageData &&
    sender.id &&
    messageData.senderId &&
    (sender.id.toString() === messageData.senderId.toString()) &&  // Verify sender listed is same as auth
    true;  // returns the last value

    console.log("VALIDATION CHECKS IS: ", checks);
    return !!checks;  // BangBang, just to be safe
  } catch(e) {
    console.log("Error in validations was caught: ", e);
    return false;
  }
}

function sanitizedOrder(orderStr) {
  return (isValidOrder(orderStr) ? orderStr : 'DESC');  //default is DESCending
}

function isValidOrder(orderStr) {
  var ucOrder = orderStr && orderStr.toUpperCase();

  return (ucOrder === 'DESC' || ucOrder === 'ASC' ) ? true : false;
}

function buildUnreadMessagesResponse(dateOrderedResults) {
  var byListing = {};  // initially build an object by ID with redundant info inside
  dateOrderedResults.forEach( msg => {
    if(!byListing[msg.listingId])
    return mapUnreadMessagesResponse(msg);
  });
}

// Map db response to messages by listing
function getMessagesByListingForUser(username) {
  return function mapToMessagesByListing(totalObj, current) {
    if(!totalObj[current.listingId]) {
      totalObj[current.listingId] = {
        listingOwnerId: current['Listing.userId'],
        listingOwnerUsername: username,
        listingHeroImgUrl: current['Listing.heroImg'],
        listingId: current.listingId,
        messages: []
      }
    }

    // Get listing object by id, and add the message to its messages
    totalObj[current.listingId].messages.push(mapUnreadMessagesResponse(current));

    return totalObj;
  }
}

function mapUnreadMessagesResponse(msg) {
  return {
    id: msg.id,
    senderId: msg.senderId,
    recipientId: msg.recipientId,
    content: msg.content,
    status: msg.status,
    createdAt: msg.createdAt,
    listingId: msg.listingId,
  }
}
