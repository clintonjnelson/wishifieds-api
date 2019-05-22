'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      description:   { type: Sequelize.STRING, allowNull: true },
      geography:     { type: Sequelize.GEOGRAPHY('POINT', 4326) },
      geographytype: { type: Sequelize.STRING, allowNull: false, defaultValue: 'POINT', },
      postal:        { type: Sequelize.STRING, allowNull: true },
      createdAt:     { type: Sequelize.DATE,   allowNull: false, field: 'created_at' },
      updatedAt:     { type: Sequelize.DATE,   allowNull: false, field: 'updated_at' },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('locations');
  }
};
