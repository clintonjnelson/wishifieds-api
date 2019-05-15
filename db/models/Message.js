'use strict';

module.exports = (Sequelize, DataTypes) => {

  // Table name will match the definition name here
  var Message = Sequelize.define('Message', {
    id:          { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    senderId:    { type: DataTypes.INTEGER, allowNull: false, field: 'sender_id' },
    recipientId: { type: DataTypes.INTEGER, allowNull: false, field: 'recipient_id' },
    listingId:   { type: DataTypes.INTEGER, allowNull: false, field: 'listing_id' },  // LATER may remove this constraint for person-to-person conversations
    content:     { type: DataTypes.STRING, allowNull: false },
    status:      { type: DataTypes.ENUM('UNREAD', 'READ', 'DELETED'), allowNull: false, defaultValue: 'UNREAD'},
    createdAt:   { type: DataTypes.DATE, field: 'created_at' }, // Null ok here, PG will set them itself
    updatedAt:   { type: DataTypes.DATE, field: 'updated_at' }, // Null ok here, PG will set them itself
  }, {
    timestamps : true,
    tableName: 'messages',
    freezeTableName: true
  });

  Message.associate = function(models){
    // associations can be defined here
  };

  return Message;
}
