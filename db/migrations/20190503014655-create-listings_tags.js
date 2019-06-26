'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('listings_tags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      listingId: { type: Sequelize.INTEGER, field: 'listing_id' },
      tagId:     { type: Sequelize.INTEGER, field: 'tag_id' },
      createdAt: { type: Sequelize.DATE, allowNull: false, field: 'created_at' },
      updatedAt: { type: Sequelize.DATE, allowNull: false, field: 'updated_at' }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('listings_tags');
  }
};
