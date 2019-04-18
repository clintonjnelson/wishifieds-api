'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name:        { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: false },
      address1:    { type: Sequelize.STRING, allowNull: false },
      address2:    { type: Sequelize.STRING, allowNull: false },
      city:        { type: Sequelize.STRING, allowNull: false },
      state:       { type: Sequelize.STRING, allowNull: false },
      postalcode:  { type: Sequelize.STRING, allowNull: false },
      country:     { type: Sequelize.STRING, allowNull: false },
      createdAt:   { type: Sequelize.DATE, allowNull: false, field: 'created_at' },
      updatedAt:   { type: Sequelize.DATE, allowNull: false, field: 'updated_at' }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Locations');
  }
};
