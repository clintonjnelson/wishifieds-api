'use strict';

// This handles creation of Oauth signs - whether an oauth creates one or many
// It gets the data needed, attempts to see if the sign exists somewhere
// If it exists on another account for auth, it will move the sign/auth here (auth is exclusive)
// It will when create the sign & auth for the user & return the user in the response
// reqdProfileData is the base level data, but may get extended with apiData. apiData is substitute for reqdProfileData


var request     = require('superagent'        );
var signBuilder = require('./sign_builder.js' );
var User        = require('..//models/User.js');

// Export Sign Creation Functions
module.exports = {
  findOrMakeSign: findOrMakeSign,
  createSign:     createSign,
};

function findOrMakeSign(req, userSignInfo, done) {
  var accessToken = userSignInfo.accessToken;
  var signType    = userSignInfo.signType;
  var thisSign    = userSignInfo[signType];  // note: var not string
  var user        = userSignInfo.user;
  var apiFields   = thisSign.apiFields;
  var mongo       = thisSign.mongo;
  var SignModel   = thisSign.SignModel;      // passed model directly
  var isMultiSign = userSignInfo.isMultiSign;      // Configured in Sign strategy
  console.log("IN SIGN CREATION HANDLER FOR SIGN CREATION. USER IS: ", user);
  console.log("IN SIGN CREATION HANDLER FOR SIGN CREATION. userSignInfo IS: ", userSignInfo);

  // THIS IS DONE HERE BECAUSE IF USER IS LOGGED IN, THIS IS FIRST PLACE COME TO THATS SHARED.
  // Update user auth info
  user['auth'][mongo.authType][mongo.authTypeId]  = thisSign.profileId;
  user['auth'][mongo.authType][mongo.accessToken] = accessToken;  // TODO: verify saving this way OK for ID Array
  user.save();

  // Standard or MultiSign approach?
  isMultiSign ?
    findOrMakeMultiSign() :
    findOrMakeStdSign();

  // For multi-sign sites, use this
  function findOrMakeMultiSign() {
    thisSign.getApiInfo(accessToken, thisSign.reqdProfileData, apiDataArrayCallback);

    function apiDataArrayCallback(err, fullApiData) {
      console.log("ABOUT TO MAKE SIGNS: INITIAL DATA IS: ", fullApiData);

      var multiSigns = fullApiData.multiSigns;
      if(multiSigns && multiSigns.length > 0) {

        multiSigns.forEach(function(unsavedSign, ind, orig) {
          unsavedSign.userId = user._id;  // Add user to sign
          // Query by 2 fields: signId + profileId (since multiple people can own some signs)
          var query = { siteId: unsavedSign.siteId, profileId: unsavedSign.profileId};

          // See if sign already exists.
          SignModel.findOne(query, function(err, existingSign) {
            if(err) { return console.log("DB error with sign number " + ind + " Error: ", err); }
            var userIdStr      = (user && user._id ) ? String(user._id) : 'noUserId' ;
            var signOwnerIdStr = (existingSign && existingSign.userId) ? String(existingSign.userId) : 'noOwnerId';
            console.log("EXISTING SIGN MATCHING THE EXISTING MATCH QUERY IS: ", existingSign);

            // No existing sign? create one
            if(!existingSign || !existingSign.profileId) {
              console.log("SIGN_CREATION_HANDLER: SAVING MULTISIGN: ", unsavedSign);
              unsavedSign.save(function(error, savedSign) {
                if(error) { console.log("ERROR SAVING MULTISIGN!: ", error);}
              });
            }

            // ONLY BRING THIS BACK IF HAVE CASE OF EXCLUSIVE MULTI-SIGN WEHRE ONLY ONE OWNER.
            // THEN MAKE A FLAG FOR EACH MULTISIGN TO SEE IF THIS IS AN OPTION OR NOT. IF OPTION
            // TO CHANGE OWNER ON A SIGN, THEN ALLOW IT TO PROCEED HERE. WORDPRESS SITES ARE SHARABLE.
            // else if ( signOwnerIdStr !== userIdStr ) {
            //   changeSignOwner(existingSign, user, function(){});  // empty function for "done" since may have more
            // }
          });
        });

        // all saved. Done.
        return done(null, user);
      }
    }
  }

  // For NON-multi-sign sites, use this
  function findOrMakeStdSign() {
    // Query by user profileId
    var signQuery = {profileId: thisSign.profileId};

    // Find existing sign? (avoid duplciate)
    SignModel.findOne( signQuery, function(err, sign) {
      if (err) {
        console.log('Database error finding ' + thisSign.authType +  ' sign: ', err);
        return done(err, null);
      }
      var userIdStr      = (user && user._id   ) ? String(user._id)    : 'noUserId' ;
      var signOwnerIdStr = (sign && sign.userId) ? String(sign.userId) : 'noOwnerId';

      // No sign? make one. (Auto-sign path)
      if(!sign || !sign.profileId) {
        thisSign.getApiInfo(accessToken, thisSign.reqdProfileData, function(err, apiData) {
          if(err) { return done('error accessing oauth api'); }

          return createSign(signType, apiData, user, done);
        });
      }

      // sign found. User & sign owner match => DONE
      else if( userIdStr === signOwnerIdStr ) {
        return done(null, user);  // sign exists & matches => do nothing. DONE.
      }

      // User and sign owner NOT match => remove old user oauth, link sign to current user => DONE.
      else if( userIdStr !== signOwnerIdStr ) {
        changeSignOwner(sign, user, done);
      }
    });
  }


  function changeSignOwner(sign, newOwner, done) {
    var authType   = mongo.authType;
    var authTypeId = mongo.authTypeId;
    var accToken   = mongo.accessToken;

    User.findById(sign.userId, function(err, oldUser) {
      if(err) {
        console.log('Error finding old user: ', err);
        return done('Cannot clear old user, so cannot proceed with update!');
      }
      // Clear the old owner's auth fields - id and accessToken
      oldUser['auth'][mongo.authType][mongo.authTypeId]  = null;
      oldUser['auth'][mongo.authType][mongo.accessToken] = null;

      oldUser.save(function(error, savedOldUser) {
        // Older user cleared of Oauth => link sign to current user.
        sign.userId = user._id;
        sign.status = 'A';       // Ensure status back to active
        sign.save(function(err, sign) {
          if(err) {return done('Error updating sign to user userId');}

          return done(null, user);
        });
      });
    });
  }
}


// Build & save sign with user info
function createSign(signType, apiData, user, done) {
  var newSign    = signBuilder[signType](apiData);  // build new sign w/data
  newSign.userId = user._id;                        // set userId reference
  newSign.status = 'A';                             // Ensure status is Active

  newSign.save(function(err, sign) {
    if(err) { console.log('Error saving ' + signType  + ' sign: ', err); }

    return done(null, user);  // saved. pass user & continue
  });
}

