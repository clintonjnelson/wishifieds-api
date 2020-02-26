'use strict';


module.exports = {
  mapMessages: mapMessages,
  mapMessageHasUser: mapMessageHasUser,
};

// Mapping single message (watch out for format of the User.profile_pic_url!!)
function mapMessageHasUser(msg) {
  console.log("Mapping msg for User.profile_pic_url to senderPicUrl: ", msg);
  return {
    id: msg.id,
    senderId: msg.senderId,
    recipientId: msg.recipientId,
    content: msg.content,
    status: msg.status,
    createdAt: msg.createdAt,
    listingId: msg.listingId,
    senderPicUrl: msg['User.profile_pic_url'],
  }
}

// Mapping list of multiple messages (watch out for format of the User.profilePicUrl!!)
function mapMessages(messages) {
  console.log("Mapping multiple messages: ", messages);
  return messages.map(function(msg) {
    return {
      id: msg.id,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      content: msg.content,
      status: msg.status,
      createdAt: msg.createdAt,
      listingId: msg.listingId,
      senderPicUrl: msg['User.profilePicUrl'],
    }
  })
}


// Try just modifying the original first... ^^^^
// function mapUserAndBadges(dbUser, dbBadges) {
//   var baseUser = mapUser(dbUser);
//   baseUser['badges'] = dbBadges;

//   return baseUser;
// }

