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
var Utils        = require('../lib/utils.js');
var MessagesMapper  = require('../lib/model_mappers/messages_mapper.js');
var MailService = require('../lib/mailing/mail_service.js');
var EmailBuilder = require('../lib/mailing/email_content_builder');

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
        include: [
          // Join user avatar for the sender of message
          {
            model: User,
            attributes: ['profile_pic_url']
          },
          // Join the listing on the message
          {
            model: Listing,  // include the listing associated to the message
            // Join the user associated to the listing
            // include: [{
            //   model: User,
            //   // TODO: Reduce the amount of joined variables
            //   attributes: ['id'],
            // }]
          },
        ],
        raw: true
      })
      .then(function(foundMsgs) {
        console.log("FOUND USERs MESSAGES: ", foundMsgs);
        var msgsByListing = foundMsgs.reduce(getMessagesByListingForUser(username), {});
        var listingsSortByMsgs = userSortByUnreads(userId);

        var listingsWithMessages = Object.getOwnPropertyNames(msgsByListing)
          .map(listingId => { return msgsByListing[listingId]; })
          .sort(listingsSortByMsgs);  // sort mutates orig, no return
        // vvv THIS APPEARS JUST TO BE LOGGING vvv
        listingsWithMessages.forEach( li => {
          console.log("LISTING: ", li.listingId);
          li.messages.forEach( mg => { console.log("MESSAGE ID: ", mg.id); });
        });
        //console.log("FINAL ORDER LISTINGS IS: ", listingsWithMessages);

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
        include: [
          // Join user avatar for the sender of message
          {
            model: User,
            attributes: ['profile_pic_url']
          },
          {
            model: Listing,  // Include Listing & Listing's Owner User info
            include: [{
              model: User,
              where: { id: userId }
          }
        ]
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
        // Used to just count total from user's own wishlistings, not correspondance with others
        "SELECT COUNT(*) FROM \"messages\" WHERE \"messages\".recipient_id = $userid AND \"messages\".status = 'UNREAD';",
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

    const host = req.headers.origin;
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
    const sanitizedContent = Utils.sanitizeString(messageData.content);
    const preMessage = {
      senderId:     user.id,
      recipientId:  messageData.recipientId,
      listingId:    messageData.listingId,
      content:      sanitizedContent
    };

    Message
      .create(preMessage)
      .then( message => {
        console.log("NEWLY CREATED MESSAGE IS: ", message);
        if(!message) {
          console.log("Created message was empty. Error: ", error);
          return res.status(400).json({error: true, msg: 'Could not create message.'});
        }

        // Notify recipient, IF they have notifications enabled
        db.sequelize
          .query(
            'SELECT recipient.email AS email, l.title AS listingTitle, l.user_id AS ownerid' +
              ' FROM users AS recipient' +
              ' JOIN users AS sender ON sender.id = $senderid' +
              ' JOIN listings AS l ON l.id = $listingid' +
              ' WHERE recipient.id = $recipientid' +
              ' AND recipient.email_notifications IS TRUE' +
              " AND l.status = 'ACTIVE';",
            {
              bind: {
                senderid: user.id,
                recipientid: messageData.recipientId,
                listingid: messageData.listingId
              },
              type: db.Sequelize.QueryTypes.SELECT
          })
          .then(function(queryRes) {
            console.log("Query response for message email data is: ", queryRes);
            if(queryRes && queryRes.length == 1) {
              const sendableEmailData = queryRes[0];  // Get first & only result
              const listingLink = host + '/' + user.username + '/listings/' + messageData.listingId;
              console.log("Listing link URL is: ", listingLink);

              // Create the content
              const emailContentHtml = EmailBuilder.listingMessage.buildHtmlEmailString(
                sendableEmailData['listingtitle'],
                listingLink,
                user.username,
                sanitizedContent
              );
              const emailContentText = EmailBuilder.listingMessage.buildPlainTextEmailString(
                sendableEmailData['listingtitle'],
                listingLink,
                user.username,
                sanitizedContent
              );

              console.log("Sending email now:", emailContentHtml);
              return MailService.sendEmail({
                  from: user.username,
                  to: sendableEmailData['email'],
                  subject: "Wishifieds Msg - " + sendableEmailData['listingtitle'],
                  html: emailContentHtml,
                  text: emailContentText,
                },
                function(error, data) { console.log('Email sent for message:', message.id);}
              );
            }
            else {
              console.log("Error getting info to send message email to listing owner: ", sendableEmailData);
            }
          });

        res.json({error: false, success: true, message: message});
      })
      .catch(function(error) {
        console.log("Error creating message: ", error);
        return res.status(400).json({error: true, msg: 'Could not create message.'});
      });
  });
  // User
  //         .findById({
  //           where: {'$UserSettings.emailNotifications$': true},
  //           include: [{
  //             model: UserSettings,
  //             required: true
  //           }]
  //         })
  //         .then(function(recipient) {
  //           if(recipient) {


  // db.sequelize
  //         .query(
  //           // Used to just count total from user's own wishlistings, not correspondance with others
  //           // sender name
  //           // listingID
  //           //
  //           //
  //           //

  //           "SELECT COUNT(*) FROM \"messages\" WHERE \"messages\".recipient_id = $userid AND \"messages\".status = 'UNREAD';",
  //           {
  //             bind: { userid: userId },
  //             type: db.Sequelize.QueryTypes.SELECT
  //           }
  //         )
  //         .then(function(result) {
  //           MailService.sendEmail({
  //               from: user.username,
  //               to: recipient.username,
  //               subject: "New Message on a Wish: ",  // NEED WISH TITLE HERE
  //               html: ,  // NEED TO FORMAT A TEMPLATE WITH PIECES TO INPUT: Sender's message, link to listing
  //               text: ,  // NEED TO FORMAT A TEMPLATE WITH PIECES TO INPUT: Sender's message, link to listing
  //             })
  //         })

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
        'UPDATE "messages" SET status=\'READ\' ' +
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

// ********************************** HELPERS **********************************


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
    return MessagesMapper.mapMessageHasUser(msg);
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
    totalObj[current.listingId].messages.push(MessagesMapper.mapMessageHasUser(current));

    return totalObj;
  }
}

// TODO: Figure out how to get thie to sort by these factors:
  // Sort on UNREADs
    // Sort on date of latest message (latest first)
  // Sort on date of latest message of reads

  // First, check if unread. Sort the unread first.
  // If BOTH unread, second layer of sorting is on date. Pick newest first.
      // Compare the epoch times
function userSortByUnreads(userId) {

  // -1 = a comes first; 0 = no change; 1 = b comes first
  return function sortByUnreads(listingA, listingB) {
    var aMsgLength = listingA.messages.length;
    var bMsgLength = listingB.messages.length;

    var aLast = listingA.messages.length && listingA.messages[aMsgLength-1];
    var bLast = listingB.messages.length && listingB.messages[bMsgLength-1];
    // TODO: NEED TO MAKE SURE IT"S THE CORRESPONDANT"S MESSAGE THAT"S UNREAD, NOT OWNER's
    console.log("aLast: ", aLast);
    console.log("bLast: ", bLast);


    // A vs B existence; Neither messages - no change; no A: b,a; no B: a,b
    if(!aLast && !bLast) {
      console.log("NO MSG A OR B; returning 0; no swap");
      return 0;
    }
    if(!aLast) {
      console.log("NO MSG A; returning -1; final order here", bLast.listingId, aLast.listingId);
      return 1;
    }
    if(!bLast) {
      console.log("NO MSG B; returning 1; final order here", bLast.listingId, aLast.listingId);
      return -1;
    }

    // Unreads go first, when it's from someone else (not from self)
    if( aLast.status == "UNREAD" &&
        aLast.senderId != userId &&  // If unread, not own
        !(bLast.status != "UNREAD" && bLast.senderId != userId) // Don't count ties
      ) {
      console.log("A HAS UNREAD; returning -1");
      return -1;
    }  // A unread & not owner, order A sooner
    if( bLast.status == "UNREAD" &&
        bLast.senderId != userId && // If unread, not own
        !(aLast.status != "UNREAD" && aLast.senderId != userId)  // Don't count ties
      ) {
      console.log("B HAS UNREAD; returning 1; b comes first");
      return 1;
      }  // B unread & not owner, order B sooner

    // Both Unread, lastst first
    if(Date.parse(aLast.createdAt) > Date.parse(bLast.createdAt)) {
      console.log("DATE; returning 1");
      return -1;
    }
    else {
      console.log("END; returning 1 to flip them (b created before a)");
      return 1;
    }
  }
}

// Logic to send email notifiction if user is set to get them for app messages
// TODO: Eventually, probably use the mail service or a new notification service to handle
// Fire & forget, because we don't want to interrupt a user's flow based on side effects to other user.
function sendMessageNotificationEmailIfUserIsSubscribed(userId, messageInfo) {
  // MessageInfo should probably have: link-to-page, listing title, truncated content, etc
  User.findOne({where: {userId: userId}})
      .then(function(foundUser) {



        // configure mail for sending
        var mailOptions = {
          from:    'Wishifieds Listing Message Notification <youvegotmessage@wishifieds.com>',
          to:      foundUser.email,   // Email provided by user
          subject: 'Wishifieds - Someone Messaged You On a Listing',
          html:    EmailBuilder.passwordReset.buildHtmlEmailString({ resetToken: resetToken, email: user.email, host: req.headers.origin }),
          // text: EmailBuilder.buildPasswordResetPlainTextEmailString(),
        };

        MailService.sendEmail(mailOptions, function(errr, result) {
          if(errr) {
            console.log("Error sending email: ", errr);
            return res.status(500).json({error: true, msg: 'email-failure'});
          }

          console.log('Email sent with result of: ', result);
          res.json({success: true});
        });




      })
      .catch(function(err) {
        console.log("Error finding user to send message notification email to: ", err);
      })
}
