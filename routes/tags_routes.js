'use strict';

var bodyparser   = require('body-parser'      );
var eatOnReq     = require('../lib/routes_middleware/eat_on_req.js');
var eatAuth      = require('../lib/routes_middleware/eat_auth.js'  )(process.env.AUTH_SECRET);
var User         = require('../db/models/index.js').User;
var Tag         = require('../db/models/index.js').Tag;
var Sequelize    = require('sequelize');

// :::TAGS:::
// No one owns tags, anyone can create & use.
// Created, but never updated. If need an update, create another.
// We never delete tags via UI, only as cleanup process when no one is using.


module.exports = function(router) {
  router.use(bodyparser.json());

  // Get Tag by name or ID
  router.get('/tags/search?', function(req, res) {
    const tagQuery = req.query['query'];
    const maxResults = req.query['maxresults'] || 100;

    console.log("ABOUT TO Search for a tag per the query: ", tagQuery);
    Tag
      .findAll(
        {
          where: {
            name: { [Sequelize.Op.iLike]: tagQuery+'%' },
          },
          order: [['name', 'ASC']],
          limit: maxResults
        }
      )
      .then(function(matchedTags) {
        if(!matchedTags) {
          console.log('Tried to get tags. User could not be found by: ', tagQuery);
          return res.status(404).json({error: false, msg: 'no tag found', matchedTags: {} });
        }

        console.log("TAGs FOUND: ", matchedTags);
        const tags = matchedTags.map(function(tag) { return  {id: tag.id, name: tag.name} });
        // FIXME: LIMIT THE RESULTS BASED ON MAX_RESULTS VALUE
        return res.json({error: false, tags: tags});
      })
      .catch(function(err) {
        console.log('Database error getting tags by name or id:');
        return res.status(500).json({error: true, msg: 'database error'});
      });
  });

  // Get Tag by name or ID
  router.get('/tags/:nameOrId', function(req, res) {
    var nameOrId = req.params.nameOrId;

    console.log("ABOUT TO QUERY TAG BY nameOrId");
    Tag
      .findOne({where: makeNameOrIdQuery(nameOrId) })
      .then(function(tag) {
        if(!tag) {
          console.log('Tried to get tag. User could not be found by: ', nameOrId, '. User is: ', tag);
          return res.status(404).json({error: false, msg: 'no tag found', tag: {} });
        }

        console.log("TAG FOUND: ", tag);
        return res.json({id: tag.id, name: tag.name});  // FIXME: return {data:...} or {tag:...}. Not raw object
      })
      .catch(function(err) {
        console.log('Database error getting tag by name or id:');
        return res.status(500).json({error: true, msg: 'database error'});
      });
  });

  // Create Tag
  router.post('/tags', eatOnReq, eatAuth, function(req, res) {
    console.log("IN CREATE TAGS ROUTE...");
    console.log("USER IS: ", req.user);

    res.json({error: false})
  });


  function makeNameOrIdQuery(nameOrId) {
    let query = {};
    try      { query['id'] = parseInt(nameOrId, 10); }
    catch(e) { query['name'] =  nameOrId; }

    console.log("Query for nameOrId is: ", query);
    return query;
  }
};
