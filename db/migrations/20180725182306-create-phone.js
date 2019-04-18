'use strict';

// https://stackoverflow.com/questions/41925/is-there-a-standard-for-storing-normalized-phone-numbers-in-a-database
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Phones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      countrycode: { type: Sequelize.STRING, allowNull: false },
      areacode:    { type: Sequelize.STRING, allowNull: false },
      prefix:      { type: Sequelize.STRING, allowNull: false },
      line:        { type: Sequelize.STRING, allowNull: false },
      createdAt:   { type: Sequelize.DATE, allowNull: false, field: 'created_at' },
      updatedAt:   { type: Sequelize.DATE, allowNull: false, field: 'updated_at' }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Phones');
  }
};
