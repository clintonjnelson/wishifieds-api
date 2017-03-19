'use strict';

module.exports = function(req, res, next) {
  console.log("CHECKING ADMIN AUTHORIZATION");
  var userRole = req.user && req.user.role;


  console.log("USER IS: ", req.user);
  console.log("USER ROLE IS: ", req.user && req.user.role);

  // EVERYTHING besides admin role is rejected
  if(userRole !== 'admin') {
    console.log('User is not an admin. Access denied. Responding with 401 error.');
    return res.status(401).json({error: true, msg: 'Access denied.'})
  }

  console.log("USER IS AN ADMIN.");
  return next();
}
