'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('messages', {
      id:          { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      senderId:    { type: Sequelize.INTEGER, allowNull: false, field: 'sender_id' },
      recipientId: { type: Sequelize.INTEGER, allowNull: false, field: 'recipient_id' },
      listingId:   { type: Sequelize.INTEGER, allowNull: false, field: 'listing_id' },
      content:     { type: Sequelize.STRING,  allowNull: false },
      status:      { type: Sequelize.ENUM('UNREAD', 'READ', 'DELETED'), allowNull: false, defaultValue: 'UNREAD'},
      createdAt:   { type: Sequelize.DATE,    allowNull: false, field: 'created_at' },
      updatedAt:   { type: Sequelize.DATE,    allowNull: false, field: 'updated_at' }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('messages');
  }
};
