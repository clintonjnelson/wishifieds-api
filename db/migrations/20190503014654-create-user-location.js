'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users_locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId:      { type: Sequelize.INTEGER, field: 'user_id' },
      locationId:  { type: Sequelize.INTEGER, field: 'location_id' },
      description: { type: Sequelize.STRING },
      status:      { type: Sequelize.ENUM('ACTIVE', 'DELETED'), allowNull: false, defaultValue: 'ACTIVE'},
      createdAt:   { type: Sequelize.DATE, allowNull: false, field: 'created_at' },
      updatedAt:   { type: Sequelize.DATE, allowNull: false, field: 'updated_at' }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users_locations');
  }
};
