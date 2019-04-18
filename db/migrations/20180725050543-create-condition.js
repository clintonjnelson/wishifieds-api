'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Conditions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name:      { type: Sequelize.STRING, allowNull: false },
      icon:      { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, allowNull: false, field: 'created_at' },
      updatedAt: { type: Sequelize.DATE, allowNull: false, field: 'updated_at' }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Conditions');
  }
};
