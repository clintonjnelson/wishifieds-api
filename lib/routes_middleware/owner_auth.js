'use strict';
// This validates that the user requesting a change to something/someone
// Is really the person who matches the change
// Protects from users from changing other users or other users' signs
// It takes the "fieldToCheckAgainst" off of the user and off of the routeParam
// Then it compares them to verify match before allowing updates.


// !!!!!!!!  TODO: UNIT TEST THIS MODULE     !!!!!!!

module.exports = function(fieldToCheckAgainst) {
  // Middleware format
  return function(req, res, next) {
    // Verify requested param & user param match (id, username, etc)
    var user   = req.user;
    var params = req.params;
    console.log("params IN OWNER AUTH IS: ", params, ". AND USER IS: ", user);

    switch (fieldToCheckAgainst) {
      // Check for failures on each case, else Next
      case 'id':
        if( noUserIdMatch(params, user) ) { logAndRespond401Error(res); }
        else { next(); }
        break;

      case 'username':
        if( noUsernameMatch(params, user) ) { logAndRespond401Error(res); }
        else { next(); }
        break;

      case 'usernameOrId':
        if( noUsernameOrIdMatch(params, user) ) { logAndRespond401Error(res); }
        else { next(); }
        break;

      // No case match? How did you get here?! Fail.
      default:
        logAndRespond401Error(res);
    }


  };

  function logAndRespond401Error(res) {
    console.log('User tried to hack another user.');
    return res.status(401).json({ error: 'unauthorized' });
  }

  function noUsernameOrIdMatch(params, user) {
    // Verify pieces exist for params & user
    console.log("CHECKING NO USERNAME_OR_ID MATCH");
    if(!params['usernameOrId'] || (!user['_id'] && !user['username']) ) {return true; }

    var paramsUsernameOrId   = params['usernameOrId'].toString();
    var username             = user['username'].toString();
    var userId               = user['_id'].toString();

    // Else, see if BOTH don't match (only need one match)
    return ( (paramsUsernameOrId !== username) && (paramsUsernameOrId !== userId) );
  }

  function noUsernameMatch(params, user) {
    // If missing, automatically NO match
    console.log("CHECKING NO USERNAME MATCH");
    if(!params['username'] || !user['_id']) {return true; }

    // Else, see if they don't match
    return params['username'] !== user['username'];
  }

  function noUserIdMatch(params, user) {
    // If missing either, automatically NO match
    console.log("CHECKING NO USERID MATCH");
    if(!params['id'] || !user['_id']) { return true; }

    // Else, see if they don't match
    return params['id'].toString() !== user['_id'].toString();
  }
};
