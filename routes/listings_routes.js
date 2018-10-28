'use strict';

var bodyparser = require('body-parser'      );
var eatOnReq   = require('../lib/routes_middleware/eat_on_req.js');
var eatAuth    = require('../lib/routes_middleware/eat_auth.js'  )(process.env.AUTH_SECRET);
// var ownerAuth    = require('../lib/routes_middleware/owner_auth.js');
// var adminAuth    = require('../lib/routes_middleware/admin_auth.js');
// var MailService  = require('../lib/mailing/mail_service.js');
// TODO: WILL NEED SERVICE FOR SMS INTERFACT HERE (service logic in /lib)
// var EmailBuilder = require('../lib/mailing/email_content_builder.js');
var Utils      = require('../lib/utils.js');
var Listings   = require('../db/models/index.js').Listing;
var Images     = require('../db/models/index.js').Image;
var User       = require('../db/models/index.js').User;
var Message    = require('../db/models/index.js').Message;
var zipObject  = require('lodash').zipObject;
var Sequelize  = require('sequelize');

// FK Constraints (self-verify existence): UserId, CategoryId, ConditionId,

// Images should have table structure something like this:
  // id, ref_token, url, position, listing_id, userId
  // listing_id OR user_id is required on all images

// get user
    // save listing information with relationship to user
    // save links to images (later will save links to copies in our own Bucket in AWS)
        // listing_images table where listing_id is an indexed value for fast retrieval


module.exports = function(router) {
  router.use(bodyparser.json());

  router.get('/listings/search', function(req, res) {
    console.log("REQUEST QUERY IS: ", req.query);
    console.log("Made it to SEARCH. Query param: ", req.query['search']);

    // Make the attributes variable for Advanced searches by a user.
    // FIXME: THIS IS SUPER INEFFICIENT. WRITE CUSTOMER QUERY TO GATHER IMAGES IN SQL.
    if(req.query['search'].length > 0) {
      var searchStr = req.query['search'].trim();
      Listings
        .findAll({
          where: {
            status: 'ACTIVE',
            $or: [
              { title: { [Sequelize.Op.iLike]: '%'+searchStr } },
              { keywords: { [Sequelize.Op.iLike]: '%'+searchStr } }
            ]
          },
          include: [Images]
        })
        .then(function(results) {
          console.log("RESULTS ARE: ", results);
          if(results && results.length > 0) {
            var listingIds = results.map(function(listing) { return listing.id; });
            Images
              .findAll({ where: {listingId: listingIds} })
              .then(function(images) {
                console.log("IMAGES FOUND ARE: ", images);
                var sortedImgs = images
                  .sort(function(a, b){ return a.position - b.position; })

                console.log("SORTED IMAGES ARE: ", sortedImgs);
                var listings = results.map(function(listing) {
                  return {
                    id:          listing.id,
                    userId:      listing.userId,
                    categoryId:  listing.categoryId,  // TODO: Decide if UI does the name conversion or the API
                    conditionId: listing.conditionId,  // TODO: Decide if UI does the name conversion or the API
                    title:       listing.title,
                    description: listing.description,
                    keywords:    listing.keywords,
                    linkUrl:     listing.linkUrl,
                    price:       listing.price,
                    locationId:  listing.locationId, // TODO: SHOULD THIS BE LOCATION???
                    images:      sortedImgs
                                  .filter(function(img){ return img.listingId == listing.id})
                                  .map(function(img){ return img.url }),                  // TODO: Retrieve these on the UI??
                    hero:        listing.heroImg,        // TODO: Send ONE of these
                    imagesRef:   listing.imagesRef,
                    slug:        listing.slug,
                    createdAt:   listing.createdAt,
                    updatedAt:   listing.updatedAt
                  };
                });
                console.log("LISTINGS FOUND: ", listings);

                res.json({error: false, success: true, listings: listings });
              })
              .catch(function(errr) {
                console.log("Caught error in searching for listings. Error getting images: ", err);
                res.json({error: true, success: false});
              });;
          }
          // No listings found
          else {
            res.json({error: false, success: true, listings: []});
          }
        })
        .catch(function(err) {
          console.log("Caught error in searching for listings. Error getting listings: ", err);
          res.status(500).json({error: true, success: false});
        });
    }
    else {
      res.json({error: false, success: true, listings: []});  // No search, no results
    }
  });


  // GET by listing ID
  router.get('/listings/:id', function(req, res) {
    const listingId = req.params['id'];

    if(!listingId) {
      console.log("Route param of listing ID is required.");
      res.status(400).json({error: true, success: false, msg: 'listing ID is required'});
    }

    Listings
      .findOne({where: {id: listingId}})
      .then(function(result) {
        console.log("Listing found is: ", result);
        if(!result || (result && result.length === 0)) {
          console.log("No listing found for is: ", listingId);
          return res.status(404).json({error: true, success: false, msg: 'No listing found.'});
        }
        Images
          .findAll({ where: {listingId: listingId} })
          .then(function(images) {
            console.log("IMAGES FOUND ARE: ", images);
            var sortedImgs = images.sort(function(a, b){ return a.position - b.position; });

            console.log("SORTED IMAGES ARE: ", sortedImgs);
            var listing = {
                id:          result.id,
                userId:      result.userId,
                categoryId:  result.categoryId,  // TODO: Decide if UI does the name conversion or the API
                conditionId: result.conditionId,  // TODO: Decide if UI does the name conversion or the API
                title:       result.title,
                description: result.description,
                keywords:    result.keywords,
                linkUrl:     result.linkUrl,
                price:       result.price,
                locationId:  result.locationId, // TODO: SHOULD THIS BE LOCATION???
                images:      sortedImgs.map(function(img){ return img.url }),  // get only img urls
                hero:        result.heroImg,  // TODO: Send ONE of these
                imagesRef:   result.imagesRef,
                slug:        result.slug,
                createdAt:   result.createdAt,
                updatedAt:   result.updatedAt
              };
            res.json({error: false, success: true, listing: listing });
          })
          .catch(function(err) {
            console.log("Caught error in searching for listings. Error getting images: ", err);
            res.json({error: true, success: false, msg: 'Error getting listing images.'});
          });
      })
      .catch(function(errr) {
        console.log("Caught error in searching for listing.", errr);
        res.json({error: true, success: false, msg: 'Error getting listing.'});
      });
  });


  // GET a User's Listings by their user object
  router.get('/listings/user/:usernameOrId', function(req, res) {
    parseOrGetUserId(req.params.usernameOrId, function(userId, error) {
      if(!userId) {
        console.log("Error finding user: ", error);
        return res.status(404).json({error: true, success: false, msg: "Could not find user/listings."});
      }
      // Make the attributes variable for Advanced searches by a user.
      // FIXME: THIS IS SUPER INEFFICIENT. WRITE CUSTOMER QUERY TO GATHER IMAGES IN SQL.
      Listings
        .findAll({
          where: {
            userId: userId,
            status: 'ACTIVE'
          }
        })
        .then(function(results) {
          console.log("RESULTS ARE: ", results);
          var listingIds = results.map(function(listing) { return listing.id; });
          Images
            .findAll({ where: {listingId: listingIds} })
            .then(function(images) {
              console.log("IMAGES FOUND ARE: ", images);
              var sortedImgs = images
                .sort(function(a, b){ return a.position - b.position; })

              console.log("SORTED IMAGES ARE: ", sortedImgs);
              var listings = results.map(function(listing) {
                return {
                  id:          listing.id,
                  userId:      listing.userId,
                  categoryId:  listing.categoryId,  // TODO: Decide if UI does the name conversion or the API
                  conditionId: listing.conditionId,  // TODO: Decide if UI does the name conversion or the API
                  title:       listing.title,
                  description: listing.description,
                  keywords:    listing.keywords,
                  linkUrl:     listing.linkUrl,
                  price:       listing.price,
                  locationId:  listing.locationId, // TODO: SHOULD THIS BE LOCATION???
                  images:      sortedImgs
                                .filter(function(img){ return img.listingId == listing.id})
                                .map(function(img){ return img.url }),                  // TODO: Retrieve these on the UI??
                  hero:        listing.heroImg,        // TODO: Send ONE of these
                  imagesRef:   listing.imagesRef,
                  slug:        listing.slug,
                  createdAt:   listing.createdAt,
                  updatedAt:   listing.updatedAt
                };
              });
              console.log("LISTINGS FOUND: ", listings);

              res.json({error: false, success: true, listings: listings });
            })
            .catch(function(errr) {
              console.log("Caught error in searching for listings. Error getting images: ", errr);
              res.status(500).json({error: true, success: false});
            });;
        })
        .catch(function(err) {
          console.log("Caught error in searching for listings. Error getting listings: ", err);
          res.status(500).json({error: true, success: false});
        });
    });
  });


  // Get Messages for Listing
  router.get('/listings/:listingId/messages', eatOnReq, eatAuth, function(req, res) {
    // !!!!!!! WE NEED TO BRANCH THIS LOGIC TO HANDLE THE CORRESPONDANTS-ONLY case
    console.log("MADE IT TO MESSAGES ROUTE. REQ QUERY IS: ", req.query);
    const user = req.user;
    const listingId = req.params.listingId;
    const correspondantId = req.query.correspondant;
    const correspondantsOnly = req.query['correspondants_only'];

    if(!user) {
      console.log("Error getting user off of request.");
      res.status(401).json({error: true, success: false});
    }
    if(!listingId) {
      console.log("Route param of listing ID is required.");
      res.status(400).json({error: true, success: false, msg: 'listing ID is required'});
    }
    if(!correspondantId && !correspondantsOnly) {
      console.log("Query param of correspondantId is required.");
      res.status(400).json({error: true, success: false, msg: 'correspondant ID or correspondantsOnly flag is required'});
    }

    // TODO: break this logic into two separate functions or even start a Service Layer

    // For case when NON-owner is requesting, get messages between themselves & listing owner
    if(!!correspondantId) {
      // First get all user messages that have a foreign key of this listingId
      // Map the messages by the correspondence
      // Messages should be sorted by MOST RECENT (createdAt DESC)
          // If the recipient is primary user, add to the user list matching sender's id
          // if the sender if primary user, add to the user list matching recipient recipient's id
      // Return the mapped object
      // Example. Remember ALL for one listing...

      // User order to match the order of messages received
      // Dedup, while keeping first-order
      // OR, set an ordering by user on the user object itself & using a counter


      // TODO: Make sure that the
      Message
        .findAll({
          where: {
            listingId: listingId,
            $or: [
              { senderId: correspondantId },
              { recipientId: correspondantId }
            ]
          },
          order: Sequelize.literal('"created_at" DESC'),  // [['createdAt', 'DESC']]
          raw: true  // JUST give the values back
        })
        // This is going to list messages info by user name, so can order
        // FIXME??? I'm not even sure this is what we want to do. May group all of a users messages together. :-P
        //    Probably want more to arrange messages between two users by date, which the SQL should do anyway.
        .then(function(allMessages) {
          // console.log("MESSAGES FOUND: ", allMessages);
          // const ownerId = user.id;
          // let userOrder = 0;
          // let messagesByUser = {};
          // let listingMessages = [];
          // allMessages.forEach(message => {
          //   // Build message info into correct user object
          //   // Set the tracked user Id contacting ON the listing
          //   let userId = (message.senderId !== ownerId ? message.senderId : message.recipientId);

          //   // If user is not yet in the object, add them
          //   if(!messagesByUser[userId]) {
          //     messagesByUser[userId] = {};
          //   }

          //   // Create quick reference to user's spot
          //   let usrObj = messagesByUser[userId];

          //   // No order number yet? Set one & increment counter.
          //   if(!usrObj.order) {
          //     usrObj.order = userOrder;
          //     userOrder++;
          //   }
          //   if(message.status === "UNREAD") {
          //     usrObj.hasUnread = true;
          //   }
          //   // Add to or create messages array for user
          //   if(usrObj.messages && usrObj.messages.length) {
          //     usrObj.messages.push(message);
          //   }
          //   else {
          //     usrObj['messages'] = [message];  // new array with one message in it
          //   }
          // });

          // console.log("MESSAGES BY USER WITH ORDER IS: ", messagesByUser);

          // // Order the response object to match messages priority order
          // Object.keys(messagesByUser)
          //   .sort(function(prior, current) { return messagesByUser[prior].order - messagesByUser[current].order; })
          //   .forEach(function(usrId) {
          //     listingMessages.push(messagesByUser[usrId]);
          //   });

          // TODO: Probably do want something like the above to highlight unread msga, but not sure about other logic.
          console.log("FINAL MESSAGES TO SEND ARE: ", allMessages);

          res.json({error: false, success: true, listingMessages: allMessages});
        })
        .catch(function(error) {
          console.log("Caught error in getting messages for listing: ", error);
          res.status(500).json({error: true, success: false, msg: 'Error getting messages for listing.'});
        });
    }
    // For case when listing owner wants to get all messages, we return list of correspondants so can rerieve messages for each
    else if(!!correspondantsOnly) {
      Message
        .findAll(
          {
            where: { listingId: listingId },
            order: Sequelize.literal('"created_at" DESC'),
            raw: true  // JUST give the values back
          }
        )
        .then(function(allMessages) {
          console.log("ALL MESSAGES FOUND ARE: ", allMessages);
          var uniqueCorrespondants = new Set();
          allMessages.forEach(function(msg) {
            // Attempt to add every correspondant to the set
            uniqueCorrespondants.add(msg.senderId);
            // Probably don't need this, since sender will first always be NOT the owner, so would cover everyone
            uniqueCorrespondants.add(msg.recipientId);
          });
          console.log("Final correspondant's list for listing is: ", uniqueCorrespondants);

          res.json({error: false, success: true, correspondants: Array.from(uniqueCorrespondants)});
        })
        .catch(function(error) {
          console.log("Caught error in getting messages for listing: ", error);
          res.status(500).json({error: true, success: false, msg: 'Error getting messages for listing.'});
        });
    }
  });

  // Create New Listing
  // TODO: ADD BACK THE EATAUTH!!!!!!!!
  router.post('/listings', function(req, res) {
    const user = req.user;
    const listingData = req.body.listingData;

    console.log("BODY IS: ", req.body);
    console.log("User IS: ", user);

    if(passesCriticalValidations(listingData)) {
      const preListing = {
        categoryId: listingData.category,
        conditionId: listingData.condition,
        title: listingData.title,
        description: listingData.description,
        price: listingData.price,
        linkUrl: listingData.linkUrl,
        keywords: listingData.keywords,
        locationId: listingData.location,
        heroImg: listingData.images[0],  // First image is hero
        imagesRef: "tbd",
        userId: listingData.userId,  // TODO: UPDATE THIS TO GET USER OFF OF REQUEST (getting from listing data for now for dev speed)
        slug: "tbd",
        status: 'ACTIVE'
      };

      Listings
        .create(preListing)
        .then( listingObject => {
          console.log("NEWLY CREATED LISTING IS: ", listingObject);
          const newListing = listingObject.dataValues;

          // Save Images
          saveImages(listingData.images, true, 'tbd ref', newListing.id, newListing.userId, function(wasSuccessful) {    // TODO: UPDATE userId TO GET USER OFF OF REQUEST (getting from listing data for now for dev speed)
            if(wasSuccessful) {
              console.log("Successfully saved images.");
              newListing['images'] = listingData.images;

              const responseListing = {
                id:          newListing.id,
                userId:      newListing.userId,
                categoryId:  newListing.categoryId,  // TODO: Decide if UI does the name conversion or the API
                conditionId: newListing.conditionId,  // TODO: Decide if UI does the name conversion or the API
                title:       newListing.title,
                description: newListing.description,
                keywords:    newListing.keywords,
                linkUrl:     newListing.linkUrl,
                price:       newListing.price,
                locationId:  newListing.locationId, // TODO: SHOULD THIS BE LOCATION???
                status:      newListing.status,
                images:      listingData.images,  // NOTE: IF ISSUES WITH IMAGES UPDATE vs NORMAL, CHECK HERE!! FIXME??
                hero:        newListing.heroImg,
                imagesRef:   newListing.imagesRef,
                slug:        newListing.slug,
                createdAt:   newListing.createdAt,
                updatedAt:   newListing.updatedAt
              }

              // Success response & updated Listing (if needed)
              res.json({error: false, success: true, listing: responseListing});
            }
          })
        })
        .catch(function(error) {
          console.log('Error finding listing. Error: ', error);
          return res.status(404).json({ error: true });
        });
    }
    else {
      return res.status(400).json({error: true, msg: 'Did not pass basic content checks.'});
    }
    // Save basic listing info
    // Save images info; save reference to the primary image
    // Save new location (no ID) or reference existing one (has existing ID)
  });

  // Update Listing
  // TODO: ADD BACK THE EATAUTH!!!!!!!!
  router.put('/listings/:listingId', function(req, res) {
    console.log("BODY IS: ", req.body);

    const user = req.user;
    const listingId = req.params.listingId;
    const listingData = req.body.listingData;


    // Verify listing ID's match
    // Get the listing
    // Verify the user ID's match (req.user.id & listing.userId)
    // Verify the proper parts exist on the Listing
        // location created in UI, not here
        // first image is hero; save all & note position (order)
    // Verify no injection/scripting issues on the URL's
    // Verify no injection/scripting issues on the text
    if(passesCriticalValidations(listingData)) {
      Listings
        .findOne({ where: {id: listingId} })
        .then(function(foundListing) {
          if(!foundListing) {
            console.log('Could not find listing by id: ', listingId);
            return res.status(400).json({error: true, msg: 'Listing not found.'});
          }
          console.log("LISTING FOUND FOR UPDATING: ", foundListing);

          // Verify Listing & Requesting User ID's match
          // TODO: break this out into a helper method below routes?
          if(foundListing.userId !== user.id) {
            console.log('Error: Listing user ID: ', foundListing.userId, ' and requesting user ID: ', user.id, ' do not match.');
            return res.status(401).json({error: true, msg: 'Unauthorized.'});
          }

          // Save imageUrls/images with reference
          // TODO: SHOULD LOOK FOR IMAGE BEFORE CREATING COMPLETE NEW ONE
          // TODO: Should be able to use same URL, but do not want to save multiple of same image file
          const imagesRef = listingData.imagesRef || Utils.generateGenericToken();

          // Specify fields we allow to be updated
          let allowedUpdates = {
            categoryId:  listingData.categoryId,
            conditionId: listingData.conditionId,
            title:        Utils.sanitizeString(listingData.title),
            description:  Utils.sanitizeString(listingData.description),
            price:        Utils.sanitizeString(listingData.price),
            linkUrl:      Utils.sanitizeUrl(listingData.linkUrl),
            keywords:     Utils.sanitizeString(keywords),
            locationId:  listingData.locationId,
            heroImg:     listingData.images[0],
            imagesRef:   imagesRef,
            userId:      userId,
            slug:         Utils.generateUrlSlug(title),
            // status cannot be changed here for now (always active). Later may do deleted, fulfilled, private, etc.
          }

          // iterate through each thing to update, and set that value on the foundUser object using setter
          Object.keys(allowedUpdates).forEach(function(field) {
            foundListing.setDataValue(field, allowedUpdates[field]);
          });

          console.log("Listing PRIOR TO UPDATING IS: ", foundListing);

          // TODO: Flow needs to be restructured. Should be a transaction? Images & Listing should succeed.
              // On success, return either the data (or just a success message?)
              // On failure, should return an error with info for the UI
          foundListing
            .save()
            .then(function(updatedListing) {
              saveImages(listingData.images, false, imagesRef, listingId, userId, function(wasSuccessful) {
                console.log("SAVING IMAGES WAS SUCCESSFUL: ", wasSuccesful);

                // Success response & updated Listing (if needed)
                res.json({error: false, success: true, listing: {
                  id:          updatedListing.id,
                  userId:      updatedListing.userId,
                  categoryId:  updatedListing.categoryId,  // TODO: Decide if UI does the name conversion or the API
                  conditionId: updatedListing.conditionId,  // TODO: Decide if UI does the name conversion or the API
                  title:       updatedListing.title,
                  description: updatedListing.description,
                  keywords:    updatedListing.keywords,
                  linkUrl:     updatedListing.linkUrl,
                  price:       updatedListing.price,
                  locationId:  updatedListing.locationId, // TODO: SHOULD THIS BE LOCATION???
                  status:      updatedListing.status,
                  hero:        updatedListing.heroImg,
                  images:      listingData.images,  // NOTE: IF ISSUES WITH IMAGES UPDATE vs NORMAL, CHECK HERE!! FIXME??
                  imagesRef:   updatedListing.imagesRef,
                  slug:        updatedListing.slug,
                  createdAt:   updatedListing.createdAt,
                  updatedAt:   updatedListing.updatedAt
                }})
              });
            })
            .catch(function(err) {
              console.log('Error updating user. Error: ', err);
              return respond400ErrorMsg(res, 'error saving user');
            });
        })
        .catch(function(error) {
          console.log('Error finding listing. Error: ', error);
          return res.status(404).json({ error: true });
        });
    }
    else {
      return res.status(400).json({error: true, msg: 'Did not pass basic content checks.'});
    }

    // Save basic listing info
    // Save images info; save reference to the primary image
    // Save new location (no ID) or reference existing one (has existing ID)
  });





  // --------------------------------- HELPERS ---------------------------------
  // TODO: MOVE TO response.js in lib
  function respond400ErrorMsg(res, errorMsg) {
    console.log('Error in data. Sending 400 msg: ', errorMsg);
    return res.status(400).json({error: true, msg: errorMsg});
  }

  // Critical pre-save checks
  function passesCriticalValidations(listingData) {
    const checks = listingData.category &&
    listingData.condition &&
    listingData.title &&
    listingData.description &&
    listingData.price &&
    listingData.location &&
    (listingData.images.length > 0) &&
    listingData.keywords &&
    true;

    // TODO: CHECK FOR MALICIOUS CONTENT HERE!!!!!!!!
    // TODO: ALSO CHECK EACH OF THE IMAGE URLS TO SCRUB ANY JS CONTENT OR DELETE THE IMAGE.

    console.log("CHECKS IS: ", checks);
    return !!checks;
  }

  // Same for creation & update
  // TODO: Break out into separate functions for create vs update
  function saveImages(images, newListing, imagesRef, listingId, userId, callback) {

    // Listing Updates
    if(!newListing) {
      const imagesMetadata = images.map( (url, index) => {
        Images
          .findOrCreate({ where: {
            reftoken:   imagesRef,
            origurl:    url,
            url:        url,        // Someday this may be different.
            position:   index,
            listingId: listingId,
            userId:    userId
          }})
          .spread(function(image, metadata) {
            console.log("CREATED IMAGE METADATA IS: ", metadata);
            return metadata;  // metadata about what happened
          });
      });

      // Wait for all to resolve
      Sequelize.Promise
        .all(imagesMetadata)
        .then(function(results) {
          console.log("SAVED IMAGES RESULTS METADATA IS: ", results);
          const success = (results.length === images.length);
          callback(success);
        });
    }

    // Listing Creation
    else {
      const imagesForCreation = images.map( (url, index) => {
        return {
          reftoken:   imagesRef,
          origurl:    url,
          url:        url,        // Someday this may be different.
          position:   index,
          listingId:  listingId,
          userId:     userId
        };
      });

      Images
        .bulkCreate(imagesForCreation)
        .then(function(results) {
          console.log("RESULTS METADATA OF IMAGE CREATIONS ARE: ", results);
          const success = (results.length === images.length);
          callback(success);
        });
    }
  }

  function parseOrGetUserId(usernameOrId, callback) {
    if( isNaN(parseInt(usernameOrId, 10)) ) {
      User
        .findOne({where: {username: usernameOrId}})
        .then(function(user) {
          callback(user.id, null);
        })
        .catch(function(error) {
          callback(null, error);
        });
    }
    else {
      callback(parseInt(usernameOrId, 10), null);
    }

    // console.log("ATTEMPTING TO PARSE: ", usernameOrId);
    // try {
    //   console.log("PARSES AS: ", parseInt(usernameOrId, 10));
    //   return { id:  };
    // }
    // catch(e) {
    //   console.log("Failed to convert param to ID, creating username query with username: ", usernameOrId);
    //   return { username: usernameOrId };
    // }
  }
}

//     eg: BODY IS:  { listingData:
//      { category: '2',
//        condition: '2',
//        title: 'Cool Thing Wanted But Description Is Way Too Long',
//        description: 'Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor Lorem ipsu…
//        linkUrl: 'https://www.etsy.com/listing/536967730/fox-baby-booties-baby-shoes-cotton-baby?ref=shop_home_active_48',
//        images:
//         [ 'https://i.etsystatic.com/isla/ecec84/16592530/isla_fullxfull.16592530_9kusymrl.jpg?version=0',
//           'https://i.etsystatic.com/5937962/d/il/715023/1046253996/il_75x75.1046253996_m14j.jpg?version=0',
//           'https://i.etsystatic.com/5937962/d/il/e2ba81/1046247554/il_75x75.1046247554_1082.jpg?version=0' ],
//        heroImage: 'https://i.etsystatic.com/isla/ecec84/16592530/isla_fullxfull.16592530_9kusymrl.jpg?version=0',
//        price: 100,
//        location: '2',
//        keywords: 'keyword, keyword, keyword, keyword',
//        id: '1',
//        userId: '1' } }

// const listing = {
//   id:          9,
//   userId:      8,
//   categoryId:  7,  // TODO: Decide if UI does the name conversion or the API
//   conditionId: 6,  // TODO: Decide if UI does the name conversion or the API
//   title:       "Update successful",
//   description: "update successful",
//   keywords:    "keywords, saved",
//   linkUrl:     "https://www.etsy.com/shop/ThirstyCatFountains?ref=l2-shopheader-name",
//   price:       "100",
//   locationId:  5, // TODO: SHOULD THIS BE LOCATION???
//   status:      "a",
//   images:      ["https://i.etsystatic.com/5810688/r/il/e5c56d/482647422/il_570xN.482647422_ckku.jpg"],
//   imagesRef:   "abcd1234",
//   slug:        "super-cool-title",
//   createdAt:   "2018-1-1",
//   updatedAt:   "2018-2-2"
// };
