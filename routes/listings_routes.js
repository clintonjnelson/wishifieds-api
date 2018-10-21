'use strict';

var bodyparser   = require('body-parser'      );
var eatOnReq     = require('../lib/routes_middleware/eat_on_req.js');
var eatAuth      = require('../lib/routes_middleware/eat_auth.js'  )(process.env.AUTH_SECRET);
// var ownerAuth    = require('../lib/routes_middleware/owner_auth.js');
// var adminAuth    = require('../lib/routes_middleware/admin_auth.js');
// var MailService  = require('../lib/mailing/mail_service.js');
// TODO: WILL NEED SERVICE FOR SMS INTERFACT HERE (service logic in /lib)
// var EmailBuilder = require('../lib/mailing/email_content_builder.js');
var Utils           = require('../lib/utils.js');
var Listings        = require('../db/models/index.js').Listing;
var Images          = require('../db/models/index.js').Image;
var User          = require('../db/models/index.js').User;
var zipObject       = require('lodash').zipObject;
var Sequelize       = require('sequelize');

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
              .findAll({ where: {listing_id: listingIds} })
              .then(function(images) {
                console.log("IMAGES FOUND ARE: ", images);
                var sortedImgs = images
                  .sort(function(a, b){ return a.position - b.position; })

                console.log("SORTED IMAGES ARE: ", sortedImgs);
                var listings = results.map(function(listing) {
                  return {
                    id:          listing.id,
                    userId:      listing.user_id,
                    categoryId:  listing.category_id,  // TODO: Decide if UI does the name conversion or the API
                    conditionId: listing.condition_id,  // TODO: Decide if UI does the name conversion or the API
                    title:       listing.title,
                    description: listing.description,
                    keywords:    listing.keywords,
                    linkUrl:     listing.linkUrl,
                    price:       listing.price,
                    locationId:  listing.location_id, // TODO: SHOULD THIS BE LOCATION???
                    images:      sortedImgs
                                  .filter(function(img){ return img.listing_id == listing.id})
                                  .map(function(img){ return img.url }),                  // TODO: Retrieve these on the UI??
                    hero:        listing.hero_img,        // TODO: Send ONE of these
                    imagesRef:   listing.images_ref,
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


  // GET a User's Listings by their user object
  router.get('/listings/:usernameOrId', function(req, res) {
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
            user_id: userId,
            status: 'ACTIVE'
          }
        })
        .then(function(results) {
          console.log("RESULTS ARE: ", results);
          var listingIds = results.map(function(listing) { return listing.id; });
          Images
            .findAll({ where: {listing_id: listingIds} })
            .then(function(images) {
              console.log("IMAGES FOUND ARE: ", images);
              var sortedImgs = images
                .sort(function(a, b){ return a.position - b.position; })

              console.log("SORTED IMAGES ARE: ", sortedImgs);
              var listings = results.map(function(listing) {
                return {
                  id:          listing.id,
                  userId:      listing.user_id,
                  categoryId:  listing.category_id,  // TODO: Decide if UI does the name conversion or the API
                  conditionId: listing.condition_id,  // TODO: Decide if UI does the name conversion or the API
                  title:       listing.title,
                  description: listing.description,
                  keywords:    listing.keywords,
                  linkUrl:     listing.linkUrl,
                  price:       listing.price,
                  locationId:  listing.location_id, // TODO: SHOULD THIS BE LOCATION???
                  images:      sortedImgs
                                .filter(function(img){ return img.listing_id == listing.id})
                                .map(function(img){ return img.url }),                  // TODO: Retrieve these on the UI??
                  hero:        listing.hero_img,        // TODO: Send ONE of these
                  imagesRef:   listing.images_ref,
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

  router.get('/listings/:listingId/messages', eatAuth, function() {
    const user = req.user;
    const listingId = req.params.listingId;

    if(!user) {
      console.log("Error getting user off of request.");
      res.status(401).json({error: true, success: false});
    }
    if(!listingId) {
      console.log("Route param of listing ID is required.");
      res.status(400).json({error: true, success: false, msg: 'listing ID is required'});
    }

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
    Message
      .findAll({
        where: { listing_id: listingId },
        order: ['createdAt', 'DESC']
      })
      .then(function(allMessages) {
        const ownerId = user.id;
        let userOrder = 0;
        let messagesByUser = {};
        let listingMessages = [];
        allMessages.forEach(message => {
          // Build message info into correct user object
          // Set the tracked user Id contacting ON the listing
          let userId = (message.senderId !== ownerId ? senderId : recipientId);
          let usrObj = messagesByUser[userId];

          // No order yet, set one & increment counter
          if(!usrObj.order) {
            usrObj.order = userOrder;
            userOrder++;
          }
          if(message.status === "UNREAD") {
            usrObj.hasUnread = true;
          }
          // Add to or create messages array for user
          if(usrObj.messages && usrObj.messages.length) {
            usrObj.messages.push(message);
          }
          else {
            usrObj['messages'] = [message];  // new array with one message in it
          }
        });
        // Order the response object to match messages priority order
        Object.keys(messagesByUser)
          .sort(function(prior, current) { return prior.order - current.order; })
          .forEach(function(userObj) {
            listingMessages.push(userObj);
          });

        res.json({error: false, success: true, listingMessages: listingMessages});
      })
      .catch(function(error) {
        console.log("Caught error in getting messages for listing: ", error);
        res.status(500).json({error: true, success: false, msg: 'Error getting messages for listing.'});
      });
  })

  // Create New Listing
  // TODO: ADD BACK THE EATAUTH!!!!!!!!
  router.post('/listings', function(req, res) {
    const user = req.user;
    const listingData = req.body.listingData;

    console.log("BODY IS: ", req.body);
    console.log("User IS: ", user);

    if(passesCriticalValidations(listingData)) {
      const preListing = {
        category_id: listingData.category,
        condition_id: listingData.condition,
        title: listingData.title,
        description: listingData.description,
        price: listingData.price,
        linkUrl: listingData.linkUrl,
        keywords: listingData.keywords,
        location_id: listingData.location,
        hero_img: listingData.images[0],  // First image is hero
        images_ref: "tbd",
        user_id: listingData.userId,  // TODO: UPDATE THIS TO GET USER OFF OF REQUEST (getting from listing data for now for dev speed)
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
                userId:      newListing.user_id,
                categoryId:  newListing.category_id,  // TODO: Decide if UI does the name conversion or the API
                conditionId: newListing.condition_id,  // TODO: Decide if UI does the name conversion or the API
                title:       newListing.title,
                description: newListing.description,
                keywords:    newListing.keywords,
                linkUrl:     newListing.linkUrl,
                price:       newListing.price,
                locationId:  newListing.location_id, // TODO: SHOULD THIS BE LOCATION???
                status:      newListing.status,
                images:      listingData.images,  // NOTE: IF ISSUES WITH IMAGES UPDATE vs NORMAL, CHECK HERE!! FIXME??
                hero:        newListing.hero_img,
                imagesRef:   newListing.images_ref,
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
            category_id:  listingData.categoryId,
            condition_id: listingData.conditionId,
            title:        Utils.sanitizeString(listingData.title),
            description:  Utils.sanitizeString(listingData.description),
            price:        Utils.sanitizeString(listingData.price),
            linkUrl:      Utils.sanitizeUrl(listingData.linkUrl),
            keywords:     Utils.sanitizeString(keywords),
            location_id:  listingData.locationId,
            hero_img:     listingData.images[0],
            images_ref:   imagesRef,
            user_id:      userId,
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
                  userId:      updatedListing.user_id,
                  categoryId:  updatedListing.category_id,  // TODO: Decide if UI does the name conversion or the API
                  conditionId: updatedListing.condition_id,  // TODO: Decide if UI does the name conversion or the API
                  title:       updatedListing.title,
                  description: updatedListing.description,
                  keywords:    updatedListing.keywords,
                  linkUrl:     updatedListing.linkUrl,
                  price:       updatedListing.price,
                  locationId:  updatedListing.location_id, // TODO: SHOULD THIS BE LOCATION???
                  status:      updatedListing.status,
                  hero:        updatedListing.hero_img,
                  images:      listingData.images,  // NOTE: IF ISSUES WITH IMAGES UPDATE vs NORMAL, CHECK HERE!! FIXME??
                  imagesRef:   updatedListing.images_ref,
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
            listing_id: listingId,
            user_id:    userId
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
          listing_id: listingId,
          user_id:    userId
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
