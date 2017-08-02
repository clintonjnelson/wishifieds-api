'use strict';

// TODO: Test and then refactor this file into better-modularized structure


var User         = require('../../models/User.js');
var mongoose     = require('mongoose');
var Promise      = require('promise');
var Sign         = require('../../models/Sign.js');
var log          = require('../logging/logging.js').log;
mongoose.Promise = Promise;


// Export function
module.exports = function(callback) {
  return cleanupUsersWithoutAuthCreds(callback);
}

// Get users without oauth
function cleanupUsersWithoutAuthCreds(callback) {
  var oauthPaths     = getOauthPathsFromUserModel();
  var queryFilterObj = buildOauthPathsIntoQueryFilterObj(oauthPaths);

  cleanupUsersUsingFilter(queryFilterObj, callback);


  // ---------------- Helpers ----------------
  // get oauth paths
  function getOauthPathsFromUserModel() {
    var paths = Object.keys(User.schema.obj.auth);

    removePath('basic');
    return paths;

    // ----------- Helpers ------------
    function removePath(pathName) {
      var basicIndex = paths.indexOf(pathName);
      paths.splice(basicIndex, 1);   // remove basic auth index
    }
  }

  // map oauthPaths into a mongo filter
  function buildOauthPathsIntoQueryFilterObj(oauthPaths) {
    var oauthFilters = oauthPaths.map(function(oauthProvider, ind, origArr) {
      var oauthProviderIdRef = `auth.${oauthProvider}.${oauthProvider}Id`;

      // Build oauth object
      var oauthObj = {};
      oauthObj[ oauthProviderIdRef ] = null;

      console.log("Auth object ", ind, " is: ", oauthObj);
      return oauthObj;
    });

    return oauthFilters;  // {email:null, "$and": [ {"auth.amazon.amazonId":null}, .....] }
  }


  // make the mongo request to get the filtered results
  function cleanupUsersUsingFilter(oauthFiltersObj, callback) {
    var userCleanupCount = 0;
    var filterObj = { email: null, $and: oauthFiltersObj } ;
    console.log("Query object looks like: ", JSON.stringify(filterObj));

    console.log("Getting users...");
    User.find(filterObj)
        .exec(function(err, users) {
          console.log("MADE USERS REQUEST WITH THESE USERS: ", users);
          if(err) { return console.log('Error getting users for cleaning users & usernames'); }

          // Iterate users & wait for results
          var promises = users.map(function(user) {
            return new Promise(function(resolve, reject) {
              // Try to find any non-deleted sign for user
              console.log("FINDING USER BY ID: ", user._id, " for deletion if no signs found.");
              console.log("QUERY IS: ", JSON.stringify({userId: user._id, status: { $ne: 'D'} }) );

              Sign.findOne({userId: user._id, status: { $ne: 'D'} }, function(errr, sign) {
                // Error? Don't delete user. Return promise.
                if(err) {
                  console.log('ERROR getting signs: ', errr);
                  return reject(errr);
                }
                console.log("NO ERROR. SIGN OBJECT NOT FOUND IS: ", sign);
                // Found Sign? Don't delete user.
                if(sign) {
                  console.log('Sign found for user. Skip deletion.');
                  return resolve();
                }
                // No signs? Delete user.
                else {
                  console.log('Deleting user: ', user);
                  user.remove();
                  userCleanupCount++;
                  return resolve();
                }
              });
            });
          });

          // After all resolve, report results.
          Promise.all(promises)
                 .then(function() {
                    console.log('Done cleaning up users. Users deleted: ', userCleanupCount);
                    log('task', ('Cleanup task complete. Unused users deleted: ' + userCleanupCount), 'success');
                    callback(null);
                  })
                 .catch(function() {
                    console.log('Error cleaning up users. Users deleted: ', userCleanupCount);
                    log('task', ('Cleanup task failed. Unused users deleted: ' + userCleanupCount), 'error');
                    callback("Error cleaning up users");
                  });
        });
  }
}



