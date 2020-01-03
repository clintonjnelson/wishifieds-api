'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('badges', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId:    { type: Sequelize.INTEGER, allowNull: false, field: 'user_id' },  // FK
      badgeType: { type: Sequelize.ENUM('FACEBOOK'), allowNull: false, field: 'badge_type' },
      linkUrl:   { type: Sequelize.STRING, field: 'link_url' },
      status:    { type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'DELETED'), defaultValue: "ACTIVE" },
      createdAt: { type: Sequelize.DATE, allowNull: false, field: 'created_at' },
      updatedAt: { type: Sequelize.DATE, allowNull: false, field: 'updated_at' }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('badges');
  }
};
