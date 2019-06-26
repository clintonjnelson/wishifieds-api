'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('tags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name:      { type: Sequelize.STRING, allowNull: false },
      tagType:   { type: Sequelize.ENUM('CATEGORY', 'CONDITION', 'CUSTOM'), allowNull: false, field: 'tag_type' },
      status:    { type: Sequelize.ENUM('ACTIVE', 'DELETED'), allowNull: false, defaultValue: 'ACTIVE'},
      createdAt: { type: Sequelize.DATE, allowNull: false, field: 'created_at' },
      updatedAt: { type: Sequelize.DATE, allowNull: false, field: 'updated_at' }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('tags');
  }
};
