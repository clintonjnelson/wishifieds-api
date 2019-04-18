'use strict';
module.exports = {

  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      // TODO: MAY BE ABLE TO DEFINE EXPLICIT TYPES AS ENUM
      log_type:   { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, allowNull: false, field: 'created_at' },
      updatedAt: { type: Sequelize.DATE, allowNull: false, field: 'updated_at' }
    });
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Logs');
  }
};
