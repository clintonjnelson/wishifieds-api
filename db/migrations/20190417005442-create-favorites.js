'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Favorites', {
      id:        { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      userId:    { type: Sequelize.INTEGER, field: 'user_id' },
      listingId: { type: Sequelize.INTEGER, field: 'listing_id' },
      status:    { type: Sequelize.ENUM('ACTIVE', 'DELETED'), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, field: 'created_at' },
      updatedAt: { type: Sequelize.DATE, allowNull: false, field: 'updated_at' },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Favorites');
  }
};
