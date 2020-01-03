'use strict';


module.exports = {
  mapUser: mapUser,
  mapUserSession: mapUserSession,
};


function mapUser(dbUser, badges) {
  return {
    username:      dbUser.username,
    email:         dbUser.email,
    userId:        dbUser.id,
    status:        dbUser.status,
    role:          dbUser.role,
    profilePicUrl: dbUser.profilePicUrl,
    confirmed:     dbUser.confirmed,
    badges:        badges
  };
}

function mapUserSession(dbUser, eat) {
  return {
    eat:      eat,  // NOTE: encrypted version (usr.eat is RAW)
    username: dbUser.username,
    role:     dbUser.role,
    email:    dbUser.email,
    userId:   dbUser.id
  };
}

// Try just modifying the original first... ^^^^
// function mapUserAndBadges(dbUser, dbBadges) {
//   var baseUser = mapUser(dbUser);
//   baseUser['badges'] = dbBadges;

//   return baseUser;
// }

