'use strict';

var bodyparser = require('body-parser'      );
var User       = require('../models/User.js');
var Sign       = require('../models/Sign.js');


module.exports = function(router) {
  router.use(bodyparser.json());

  router.get('/search', function(req, res) {
    console.log("SEARCH STRING RECEIVED AS: ", req.query.searchStr);

    var searchStr         = req.query.searchStr.trim();
    var partialMatchRegex = new RegExp('^.*' + searchStr + '.*$', 'i');  // ^.*George.*$
    var currentCount      = 0;    // Count tracking
    var totalSearchTypes  = 2;    // Total types of DB responses we'll expect
    var searchResults     = {};   // Object to populate for response


    User.find({'username': {'$regex': partialMatchRegex} }, buildQueryCallback('users'));
    Sign.find({'knownAs':  {'$regex': partialMatchRegex} }, buildQueryCallback('signs'));

    function buildQueryCallback(type) {
      return function queryCallback(err, results) {
        if(err) {return res.status(500).json({error: true, msg: 'database error'});}
        console.log(type + " FOUND AS: ", results);

        searchResults[type] = results;  // searchResults: {users: results}
        currentCount++;                 // Track types iterated through
        responseCheck();                // Return yet? Only if added all types.
      };

      // ensure all searches run; send when done
      function responseCheck() {
        if(currentCount === totalSearchTypes) {
          return res.json(searchResults);
        }
      }
    }
  });
};
