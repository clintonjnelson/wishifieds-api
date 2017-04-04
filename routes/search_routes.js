'use strict';

var bodyparser = require('body-parser'      );
var User       = require('../models/User.js');
var Sign       = require('../models/Sign.js');


module.exports = function(router) {
  router.use(bodyparser.json());


  // Search
  router.get('/search', function(req, res) {
    console.log("SEARCH STRING RECEIVED AS: ", req.query.searchStr);

    var searchStr         = req.query.searchStr.trim();
    var partialMatchRegex = new RegExp('^.*' + searchStr + '.*$', 'i');  // ^.*George.*$
    var regexQuery        = {'$regex': partialMatchRegex}
    var currentCount      = 0;    // Count tracking
    var searchResults     = {};   // Object to populate for response
    var resultsLimit      = 100;
    var resultsStatus     = 'A';

    // MAY HAVE TO GO BACK TO THIS AS SEARCHES GET MORE COMPLEX
    // var totalSearchTypes  = 2;    // Total DB queries before response
    // User.find({'username': {'$regex': partialMatchRegex} }, buildQueryCallback('users'));
    // Sign.find({'knownAs':  {'$regex': partialMatchRegex} }, buildQueryCallback('signs'));

    var searches = [
      { Model: User, query: { username: regexQuery, status: resultsStatus }, queryField: 'username', resultsType: 'users' },
      { Model: Sign, query: { knownAs:  regexQuery, status: resultsStatus }, queryField: 'knownAs' , resultsType: 'signs' }
    ];

    searches.forEach(function(search) {
      queryCombineAndRespondWithResults(search.Model, search.query, search.queryField, search.resultsType);
    });


    // ---------- Helpers ----------
    function queryCombineAndRespondWithResults(Model, query, queryField, resultsType) {
      Model
        .find(query)
        .sort(queryField)                            // alphabetical by name
        .skip(0)                                // USE LATER FOR PAGINATION (pag-number * resultsLimit)
        .limit(resultsLimit)                    // Limit results returned (DYNAMIC LATER?)
        .exec(buildQueryCallback(resultsType)); //execute with callback
    }

    // Puts results into the results array and responds once last search is done
    function buildQueryCallback(type) {
      return function queryCallback(err, results) {
        if(err) {return res.status(500).json({error: true, msg: 'database error'});}
        console.log(type + " FOUND AS: ", results);

        // Return only Active (LATER MAYBE PROVIDE OTHER OPTIONS BASED ON REQUEST);
        // var filteredResults = results.filter( function(result) { return result.status === 'A' } );
        searchResults[type] = results;  // searchResults: {users: results}
        currentCount++;                         // Track types iterated through
        responseCheck();                        // Return yet? Only if added all types.
      };

      // ensure all searches run; send when done
      function responseCheck() {
        if(currentCount === searches.length) {
          return res.json(searchResults);
        }
      }
    }
  });
};
