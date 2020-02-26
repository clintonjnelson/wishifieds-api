'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('confirmations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId:    { type: Sequelize.INTEGER, allowNull: true, field: 'user_id' },  // FK  // failed requests may not have userid reference
      url:       { type: Sequelize.STRING, allowNull: false},
      confirmationCode: { type: Sequelize.STRING, allowNull: true, field: 'confirmation_code' },
      status:    { type: Sequelize.ENUM('SUCCESS', 'FAILED', 'UNKNOWN', 'PENDING'), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, field: 'created_at' },
      updatedAt: { type: Sequelize.DATE, allowNull: false, field: 'updated_at' }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('confirmations');
  }
};
