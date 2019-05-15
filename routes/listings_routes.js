'use strict';

var bodyparser = require('body-parser'      );
var eatOnReq   = require('../lib/routes_middleware/eat_on_req.js');
var eatAuth    = require('../lib/routes_middleware/eat_auth.js'  )(process.env.AUTH_SECRET);
var ownerAuth    = require('../lib/routes_middleware/owner_auth.js');
// var MailService  = require('../lib/mailing/mail_service.js');
// TODO: WILL NEED SERVICE FOR SMS INTERFACT HERE (service logic in /lib)
// var EmailBuilder = require('../lib/mailing/email_content_builder.js');
var Utils      = require('../lib/utils.js');
var db         = require('../db/models/index.js');
var Listings   = db.Listing;
var Images     = db.Image;
var User       = db.User;
var Message    = db.Message;
var Favorites  = db.Favorite;
var Sequelize  = require('sequelize');

var DEFAULT_ANY_CATEGORY_ID = 1;
var DEFAULT_ANY_CONDITION_ID = 1;
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
          include: [User]
        })
        .then(function(results) {
          console.log("RESULTS ARE: ", results);
          if(results && results.length > 0) {
            var listingIds = results.map(function(listing) { return listing.id; });
            Images
              .findAll({
                where: {listingId: listingIds},
                order: [['position', 'ASC']]
              })
              .then(function(images) {
                console.log("IMAGES FOUND ARE: ", images);
                var sortedImgs = images
                  .sort(function(a, b){ return a.position - b.position; })

                console.log("SORTED IMAGES ARE: ", sortedImgs);
                var listings = results.map(function(listing) {
                  return {
                    id:          listing.id,
                    userId:      listing.userId,
                    ownerUsername: listing['User']['username'],
                    categoryId:  listing.categoryId,  // TODO: Decide if UI does the name conversion or the API
                    conditionId: listing.conditionId,  // TODO: Decide if UI does the name conversion or the API
                    title:       listing.title,
                    description: listing.description,
                    keywords:    listing.keywords,
                    linkUrl:     listing.linkUrl,
                    price:       listing.price,
                    userLocationId:  listing.userLocationId, // TODO: SHOULD THIS BE LOCATION???
                    images:      sortedImgs
                                  .filter(function(img){ return img.listingId == listing.id})
                                  .map(function(img){ return img.url }),                  // TODO: Retrieve these on the UI??
                    hero:        listing.heroImg,        // TODO: Send ONE of these
                    // imagesRef:   listing.imagesRef,
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

  // DOES THIS GO HERE??  MAY HAVE ROUTE CLASHES IF IN FAVS ROUTES. PLUS RESOURCE RETURNED IS LISTINGS...
  // Get the favorites for the requesting user
  router.get('/listings/favorites', eatOnReq, eatAuth, function(req, res) {
    const userId = req.user.id;
    console.log("IN FAVORITES ROUTE. USER ID IS: ", userId);
    Favorites
      .findAll({
        where: {
          userId: userId,
          status: 'ACTIVE'
        },
        include: [
          {
            // TODO: Specify the attributes needed to reduce the query size!
            model: Listings,  // include the listing associated to the message
            include: [{
              model: User  // include the user associated to the listing
            }]
          },
        ]
      })
      .then(function(favs) {

        console.log("FAVS ARE: ", favs);
        var results = favs.map(function(fav) {
          // console.log("fav is: ", fav);
          // console.log("fav Listing is: ", fav.Listing);
          // console.log("fav Listing values is: ", fav.Listing.get());
          return fav.Listing.get();
        });
        // Could break here to avoid an unnecessary query if results count = 0
        var listingIds = results.map(function(listing) { return listing.id; });
        Images
          .findAll({
            where: {listingId: listingIds, status: 'ACTIVE'},
            order: [['position', 'ASC']]
          })
          .then(function(images) {
            console.log("FAVS IMAGES FOUND ARE: ", images);
            var sortedImgs = images
              .sort(function(a, b){ return a.position - b.position; })

            console.log("SORTED IMAGES ARE: ", sortedImgs);
            var listings = results.map(function(listing) {
              console.log("FAVS USER IS: ", listing.User);
              return {
                id:            listing.id,
                userId:        listing.userId,
                ownerUsername: listing['User']['username'],
                categoryId:    listing.categoryId,  // TODO: Decide if UI does the name conversion or the API
                conditionId:   listing.conditionId,  // TODO: Decide if UI does the name conversion or the API
                title:         listing.title,
                description:   listing.description,
                keywords:      listing.keywords,
                linkUrl:       listing.linkUrl,
                price:         listing.price,
                userLocationId: listing.userLocationId, // TODO: SHOULD THIS BE LOCATION???
                images:        sortedImgs
                                .filter(function(img){ return img.listingId == listing.id})
                                .map(function(img){ return img.url }),                  // TODO: Retrieve these on the UI??
                hero:          listing.heroImg,        // TODO: Send ONE of these
                // imagesRef:     listing.imagesRef,
                slug:          listing.slug,
                createdAt:     listing.createdAt,
                updatedAt:     listing.updatedAt
              };
            });
            console.log("FAVS FOUND: ", listings);

            res.json({error: false, success: true, listings: listings });
          })
          .catch(function(errr) {
            console.log("Caught error in searching for favorites. Error getting images: ", errr);
            res.status(500).json({error: true, success: false});
          });
      })
      .catch(function(err) {
        console.log("Caught error in searching for favorites. Error getting listings: ", err);
        res.status(500).json({error: true, success: false});
      });
  });

  // GET by listing ID
  router.get('/listings/:id', function(req, res) {
    const listingId = req.params['id'];

    if(!listingId) {
      console.log("Route param of listing ID is required.");
      res.status(400).json({error: true, success: false, msg: 'listing ID is required'});
    }

    Listings
      .findOne({where: {id: listingId}, include: [User]})  // Join user on search
      .then(function(result) {
        console.log("Listing found is: ", result);
        if(!result || (result && result.length === 0)) {
          console.log("No listing found for is: ", listingId);
          return res.status(404).json({error: true, success: false, msg: 'No listing found.'});
        }
        Images
          .findAll({
            where: {listingId: listingId, status: 'ACTIVE'},
            order: [['position', 'ASC']]
          })
          .then(function(images) {
            console.log("IMAGES FOUND ARE: ", images);
            var sortedImgs = images.sort(function(a, b){ return a.position - b.position; });

            console.log("SORTED IMAGES ARE: ", sortedImgs);
            var listing = {
                id:          result.id,
                userId:      result.userId,
                ownerUsername: result['User']['username'],
                ownerPicUrl: result['User']['profilePicUrl'],  // TOOD: Send for the full listing Header only. Maybe break out later?
                categoryId:  result.categoryId,  // TODO: Decide if UI does the name conversion or the API
                conditionId: result.conditionId,  // TODO: Decide if UI does the name conversion or the API
                title:       result.title,
                description: result.description,
                keywords:    result.keywords,
                linkUrl:     result.linkUrl,
                price:       result.price,
                userLocationId: result.userLocationId, // TODO: SHOULD THIS BE LOCATION???
                images:      sortedImgs.map(function(img){ return img.url }),  // get only img urls
                hero:        result.heroImg,  // TODO: Send ONE of these
                // imagesRef:   result.imagesRef,
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
          },
          include: [User],
          // raw: true
        })
        .then(function(results) {
          console.log("RESULTS ARE: ", results);
          var listingIds = results.map(function(listing) { return listing.id; });
          Images
            .findAll({
              where: {listingId: listingIds, status: 'ACTIVE'},
              order: [['position', 'ASC']]
            })
            .then(function(images) {
              console.log("IMAGES FOUND ARE: ", images);
              var sortedImgs = images
                .sort(function(a, b){ return a.position - b.position; })

              console.log("SORTED IMAGES ARE: ", sortedImgs);
              var listings = results.map(function(listing) {
                console.log("LISTING USER IS: ", listing.User);
                return {
                  id:            listing.id,
                  userId:        listing.userId,
                  ownerUsername: listing['User']['username'],
                  categoryId:    listing.categoryId,  // TODO: Decide if UI does the name conversion or the API
                  conditionId:   listing.conditionId,  // TODO: Decide if UI does the name conversion or the API
                  title:         listing.title,
                  description:   listing.description,
                  keywords:      listing.keywords,
                  linkUrl:       listing.linkUrl,
                  price:         listing.price,
                  userLocationId: listing.userLocationId, // TODO: SHOULD THIS BE LOCATION???
                  images:        sortedImgs
                                  .filter(function(img){ return img.listingId == listing.id})
                                  .map(function(img){ return img.url }),                  // TODO: Retrieve these on the UI??
                  hero:          listing.heroImg,        // TODO: Send ONE of these
                  // imagesRef:     listing.imagesRef,
                  slug:          listing.slug,
                  createdAt:     listing.createdAt,
                  updatedAt:     listing.updatedAt
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

  // Note, this route has two primary paths:
    // 1) Get all of the users that have messaged owner on a given listing (no correspondantId, has correspondants_only)
    // 2) Get all of the messages for owner/correspondant on a listing (has a correspondantId)

  // Get Messages for Listing
  router.get('/listings/:listingId/messages', eatOnReq, eatAuth, function(req, res) {
    // !!!!!!! WE NEED TO BRANCH THIS LOGIC TO HANDLE THE CORRESPONDANTS-ONLY case
    console.log("MADE IT TO MESSAGES ROUTE. REQ QUERY IS: ", req.query);
    const user = req.user;
    const listingId = req.params.listingId;
    const correspondantId = req.query.correspondant;  // OPTIONAL: none or just 1:1
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
    // GET messages specific to this correspondant/Owner pair for given listing
    // Either Owner or correspondant could be requesting
    if(!!correspondantId) {
      console.log("EXECUTING THE SINGLE CORRESPONDANT QUERY...");
      Message
        .findAll({
          where: {
            listingId: listingId,
            $or: [
              { senderId: correspondantId },
              { recipientId: correspondantId }]
          },
          order: [['createdAt', 'ASC']],// Sequelize.literal('"Message"."created_at" DESC'), // [[Message, 'createdAt', 'ASC']],// Sequelize.literal('created_at ASC'),  // [['createdAt', 'ASC']] doesn't work
          raw: true  // JUST give the values back
        })
        .then(function(allMessages) {
          var unreadCounts = allMessages.reduce(getUserListingMsgsMeta(user.id), {});  // Returns object of {userId1: count1, userId2: count2, ...}
          console.log("UNREADS COUNT IS: ", unreadCounts);
          console.log("FINAL MESSAGES TO SEND ARE: ", allMessages);

          // listingMessages: [ {msg1}, {msg2}, ... ]
          res.json({
            error: false,
            success: true,
            listingMessages: allMessages,  // FIXME - MAP THIS TO UI MODEL
            unreadCounts: unreadCounts  // FIXME - THIS IS WRONG!!!!
          });
        })
        .catch(function(error) {
          console.log("Caught error in getting messages for listing: ", error);
          res.status(500).json({error: true, success: false, msg: 'Error getting messages for listing.'});
        });
    }

    // For case when listing owner wants to get all messages
      // We return list of correspondants so UI can rerieve messages for each.
    else if(!!correspondantsOnly) {
      Message
        .findAll(
          {
            where: { listingId: listingId },
            // order: Sequelize.literal('"created_at" DESC'),
            include: [User],
            raw: true  // JUST give the values back
          }
        )
        .then(function(allMessages) {
          console.log("ALL MESSAGES FOUND ARE: ", allMessages);
          var uniqueCorrespondants = new Set();
          var unreadCount = {};
          // allMessages.forEach(function(msg) {
          //   // Attempt to add every correspondant to the set
          //   uniqueCorrespondants.add(msg.senderId);
          //   // Probably don't need this, since sender will first always be NOT the owner, so would cover everyone
          //   uniqueCorrespondants.add(msg.recipientId);
          // });
          // uniqueCorrespondants.delete(user.id); // Delete owner from this list. Never need.

          // FIXME: shouldn't be counting in code, but in SQL (but hassle in sequelize)
          // var totalUnread = allMessages.reduce(generateUnreadsCounter(user.id), {});
          var initialMetaData = allMessages.reduce(getUserListingMsgsMeta(user.id), {});
          var response = {
            totalUnread: initialMetaData.totalUnread,
            correspondants:
              Object
                .getOwnPropertyNames(initialMetaData)
                .filter(function(key) { return (key !== 'totalUnread'); })  // remove totalUnreads
                .map(function(key, keyInd, keyArr) {
                  return initialMetaData[key];   // return the contents
                })
          };
          console.log("Listing Messages response IS: ", response);

          // {
          //   totalUnread: 1,
          //   correspondants: [
          //    { userMsgMeta: {userId: 2, unreadCount: 1, picUrl: 'www'} }
          //   ]
          // }
          res.json({
            error: false,
            success: true,
            correspondants: response.correspondants,  // TODO: Change to: { id: 5, profile_pic_url: 'www', unreadsCount: 2}
            totalUnread: response.totalUnread
          });
        })
        .catch(function(error) {
          console.log("Caught error in getting messages for listing: ", error);
          res.status(500).json({error: true, success: false, msg: 'Error getting messages for listing.'});
        });
    }
  });

  // Uses closure to populate the userId field & return a function to use
  // Returns: {
  //   userMsgMeta: {2: {userId: 2, unreadCount: 1, picUrl: 'www'}},
  //   totalCount:
  // }
  function getUserListingMsgsMeta(requestorId) {
    // This function is to be used in a reducer
    // Returns: {userId1: count1, userId2: count2, ...}
    return function unreadCounter(countsObj, current) {
      // Initialize user meta object, if not exist yet
      if(!countsObj[current.senderId] && (current.senderId !== requestorId) ) {
        countsObj[current.senderId] = {
          userId: current.senderId,
          unreadCount: 0,
          picUrl: current["User.profilePicUrl"]
        }
      }
      if(!countsObj['totalUnread']) {
        countsObj['totalUnread'] = 0;
      }

      // Handle unreads, only counting messages sent by other than requestor
      if( (current.status === "UNREAD") && (current.senderId !== requestorId) ) {
        countsObj['totalUnread'] ++;
        countsObj[current.senderId]['unreadCount'] ++
      }
      console.log("COUNTS OBJECT IS: ", countsObj);
      return countsObj;
    }
  }


  // Create New Listing
  router.post('/listings', eatOnReq, eatAuth, function(req, res) {
    const user = req.user;
    const listingData = req.body.listingData;

    console.log("BODY IS: ", req.body);
    console.log("User IS: ", user);

    if(passesCriticalValidations(listingData)) {
      const preListing = {
        categoryId: listingData.categoryId || DEFAULT_ANY_CATEGORY_ID,
        conditionId: listingData.conditionId || DEFAULT_ANY_CONDITION_ID,
        title: listingData.title,
        description: listingData.description,
        price: listingData.price,
        linkUrl: listingData.linkUrl,
        keywords: listingData.keywords,
        userLocationId: listingData.userLocationId,
        heroImg: listingData.images[0],  // First image is hero
        userId: user.id,
        slug: "tbd",
        status: 'ACTIVE',
      };

      Listings
        .create(preListing)
        .then( listingObject => {
          console.log("NEWLY CREATED LISTING IS: ", listingObject);
          const newListing = listingObject.dataValues;

          // Save Images
          saveImages(listingData.images, true, newListing.id, newListing.userId, function(wasSuccessful) {    // TODO: UPDATE userId TO GET USER OFF OF REQUEST (getting from listing data for now for dev speed)
            if(wasSuccessful) {
              console.log("Successfully saved images.");
              newListing['images'] = listingData.images;

              const responseListing = {
                id:          newListing.id,
                userId:      newListing.userId,
                ownerUsername: user.username,
                categoryId:  newListing.categoryId,  // TODO: Decide if UI does the name conversion or the API
                conditionId: newListing.conditionId,  // TODO: Decide if UI does the name conversion or the API
                title:       newListing.title,
                description: newListing.description,
                keywords:    newListing.keywords,
                linkUrl:     newListing.linkUrl,
                price:       newListing.price,
                userLocationId: newListing.userLocationId, // TODO: SHOULD THIS BE LOCATION???
                status:      newListing.status,
                images:      listingData.images,  // NOTE: IF ISSUES WITH IMAGES UPDATE vs NORMAL, CHECK HERE!! FIXME??
                hero:        newListing.heroImg,
                // imagesRef:   newListing.imagesRef,
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
  router.put('/listings/:listingId', eatOnReq, eatAuth, function(req, res) {
    console.log("BODY IS: ", req.body);

    const user = req.user;
    const userId = user.id;
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
        .findOne({
          where: {
            id: listingId,
            userId: user.id
          }
        })
        .then(function(foundListing) {
          var foundListingValues = foundListing.dataValues;
          if(!foundListing) {
            console.log('Could not find listing by id: ', listingId);
            return res.status(400).json({error: true, msg: 'Listing not found.'});
          }
          console.log("LISTING FOUND FOR UPDATING: ", foundListing);

          // Verify Listing & Requesting User ID's match
          // TODO: break this out into a helper method below routes?
          if(foundListingValues.userId !== userId) {
            console.log('Error: Listing user ID: ', foundListingValues.userId, ' and requesting user ID: ', userId, ' do not match.');
            return res.status(401).json({error: true, msg: 'Unauthorized.'});
          }

          // Save imageUrls/images with reference
          // TODO: SHOULD LOOK FOR IMAGE BEFORE CREATING COMPLETE NEW ONE
          // TODO: Should be able to use same URL, but do not want to save multiple of same image file
          // const imagesRef = foundListing.imagesRef || Utils.generateGenericToken();

          console.log("Creating listing object updates...")
          // Specify fields we allow to be updated
          let allowedUpdates = {
            categoryId:     listingData.categoryId,
            conditionId:    listingData.conditionId,
            title:          Utils.sanitizeString(listingData.title),
            description:    Utils.sanitizeString(listingData.description),
            price:          Utils.sanitizeString(listingData.price),
            linkUrl:        Utils.sanitizeUrl(listingData.linkUrl),
            keywords:       Utils.sanitizeString(listingData.keywords),
            userLocationId: listingData.userLocationId,
            heroImg:        listingData.images[0],
            // imagesRef:    foundListing.imagesRef,
            userId:         userId,
            slug:           Utils.generateUrlSlug(listingData.title),
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
              saveImages(listingData.images, false, listingId, userId, function(wasSuccessful) {
                console.log("SAVING IMAGES WAS SUCCESSFUL: ", wasSuccessful);

                // Success response & updated Listing (if needed)
                res.json({error: false, success: true, listing: {
                  id:            updatedListing.id,
                  userId:        updatedListing.userId,
                  ownerUsername: user.username,
                  categoryId:    updatedListing.categoryId,  // TODO: Decide if UI does the name conversion or the API
                  conditionId:   updatedListing.conditionId,  // TODO: Decide if UI does the name conversion or the API
                  title:         updatedListing.title,
                  description:   updatedListing.description,
                  keywords:      updatedListing.keywords,
                  linkUrl:       updatedListing.linkUrl,
                  price:         updatedListing.price,
                  userLocationId: updatedListing.userLocationId, // TODO: SHOULD THIS BE LOCATION???
                  status:        updatedListing.status,
                  hero:          updatedListing.heroImg,
                  images:        listingData.images,  // NOTE: IF ISSUES WITH IMAGES UPDATE vs NORMAL, CHECK HERE!! FIXME??
                  // imagesRef   updatedListing.imagesRef,
                  slug:          updatedListing.slug,
                  createdAt:     updatedListing.createdAt,
                  updatedAt:     updatedListing.updatedAt
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
    const checks = listingData.title &&
    listingData.description &&
    listingData.price &&
    listingData.userLocationId &&
    (listingData.images.length > 0)
    true;

    // TODO: CHECK FOR MALICIOUS CONTENT HERE!!!!!!!!
    // TODO: ALSO CHECK EACH OF THE IMAGE URLS TO SCRUB ANY JS CONTENT OR DELETE THE IMAGE.

    console.log("CHECKS IS: ", checks);
    return !!checks;
  }

  // Same for creation & update
  // TODO: Break out into separate functions for create vs update
  function saveImages(images, newListing, listingId, userId, callback) {

    // Listing Updates
    if(!newListing) {
      // Make sure to order by POSITION
      const imagesMetadata = Images
        .findAll({
          where: { listingId: listingId, status: 'ACTIVE' },
          order: [['position', 'ASC']],
        })
        .then(function(existingImages) {
          console.log("Initial images found prior to updating are: ", existingImages);
          const existingUrls = existingImages.map(function(img) { return img.url; });
          console.log("Existing urls found are: ", existingUrls);

          // Add First
          const adds = images.filter(function(url) {
            return !existingUrls.includes(url); // ONLY keep urls we don't have already
          });
          console.log("Found all images to add: ", adds);
          console.log("CONDITIONAL FOR ADDS IS: ", (adds & adds.length));
          if(adds && adds.length) {
            console.log("Adding new images: ", adds);
            const imageAdds = adds.map(function(url, index) {  // Build array of objects to create
              return {
                origurl:    url,
                url:        url,        // Someday this may be different.
                position:   index,
                listingId:  listingId,
                userId:     userId
              };
            });

            console.log("IMAGE OBJECTS TO CREATE ARE: ", imageAdds);
            Images.bulkCreate(imageAdds);
          }

          // Then Delete
          const dels = existingUrls.filter(function(url) {
            return !images.includes(url);
          });
          console.log("Found all images to delete: ", dels);
          if(dels && dels.length) {
            // TODO: This will be SLOW matching on string; fix by getting image ID from code instead
            Images.update({status: 'DELETED'}, {where: { url: dels }});
          }

          // Update Position
          images.forEach(function(url, index) {
            console.log("Next image for update is: ", url);
            Images
              .update({position: index}, {where: {url: url}})
              .then( (result) => { console.log("Success updating img index: ", index, " and url: ", url); })
              .catch( (err) => { console.log("Error updating img:", url.url, " position: ", index); });
          });
        });

      // const imagesMetadata = images.map( (url, index) => {
      //   Images
      //     .findOrCreate({ where: {
      //       // reftoken:   imagesRef,
      //       // origurl:    url,
      //       url:    url,
      //       // position:   index,
      //       listingId: listingId,
      //       userId:    userId
      //     }})
      //     .spread(function(image, metadata) {
      //       console.log("CREATED IMAGE METADATA IS: ", metadata);
      //       return metadata;  // metadata about what happened
      //     });
      // });

      // Wait for all to resolve
      Sequelize.Promise
        .all([imagesMetadata])
        .then(function(responses) {
          Images
            .findAll({
              where: { listingId: listingId, status: 'ACTIVE'},
              order: [['position', 'ASC']],
            })
            .then(function(updatedImages) {
              console.log("Updated images are: ", updatedImages);
              const success = (updatedImages.length === images.length);
              callback(success);
            })
            .catch( (err) => {
              console.log("Error updating images: ", err);
              callback(false);  // TODO: update this to something more useful someday
            });
        });
    }

    // Listing Creation
    else {
      const imagesForCreation = images.map( (url, index) => {
        return {
          // reftoken:   imagesRef,
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
  }
}

