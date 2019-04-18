'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      origurl:    { type: Sequelize.STRING, allowNull: false },
      url:        { type: Sequelize.STRING, allowNull: false },
      position:   { type: Sequelize.INTEGER, allowNull: false },
      listingId:  { type: Sequelize.INTEGER, field: 'listing_id' },  // this or user_id MUST not be null
      userId:     { type: Sequelize.INTEGER, field: 'user_id' },  // this or user_id MUST not be null
      createdAt:  { type: Sequelize.DATE, allowNull: false, field: 'created_at' },
      updatedAt:  { type: Sequelize.DATE, allowNull: false, field: 'updated_at' },
      status:     { type: Sequelize.ENUM('ACTIVE', 'DELETED'), allowNull: false},
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Images');
  }
};
